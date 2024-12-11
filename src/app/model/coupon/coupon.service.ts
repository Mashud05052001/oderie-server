import { Coupon, ProductCoupon } from "@prisma/client";
import { TExtendedUserData } from "../../interface/jwt.type";
import { TCouponCreate } from "./coupon.interface";
import { generateRandomCode } from "../../shared/generateResetCode";
import { prisma } from "../../config";
import AppError from "../../errors/AppError";
import httpStatus, { BAD_REQUEST } from "http-status";

const createCoupon = async (
  userInfo: TExtendedUserData,
  payload: TCouponCreate
) => {
  if (new Date() > payload.expiryDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot create a coupon where expiry date is already expired."
    );
  }
  const productIds = payload.productIds;

  const couponData = {
    code: payload?.code || generateRandomCode(6),
    expiryDate: payload.expiryDate,
    percentage: payload.percentage,
    vendorId: userInfo.vendorId as string,
  };

  const allProductsOfTheVendor = await prisma.product.findMany({
    where: { vendorId: userInfo.vendorId as string, isDeleted: false },
    select: { id: true, img: true, title: true },
  });

  if (productIds.length !== allProductsOfTheVendor.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Something went wrong. Please try again after sometime"
    );
  }
  const nonVendorProduct = allProductsOfTheVendor.filter(
    (item) => !productIds.includes(item.id)
  );

  if (nonVendorProduct.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot create coupon on another vendor products"
    );
  }

  const result = await prisma.$transaction(async (tsx) => {
    const coupon = await tsx.coupon.create({ data: couponData });
    const productCouponData: ProductCoupon[] = productIds.map((item) => ({
      productId: item,
      couponId: coupon.id,
    }));
    await tsx.productCoupon.createMany({ data: productCouponData });

    return coupon;
  });
  return result;
};

const updateCoupon = async (
  userInfo: TExtendedUserData,
  payload: Partial<Pick<Coupon, "expiryDate" | "percentage" | "code">>,
  couponId: string
) => {
  const vendorId = userInfo?.vendorId as string;
  if (payload?.expiryDate && new Date() > payload.expiryDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot update a coupon where expiry date is already expired."
    );
  }
  const isExist = await prisma.coupon.findUnique({
    where: { id: couponId, vendorId },
  });

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "This coupon is not found!");
  }
  const result = await prisma.coupon.update({
    where: { id: couponId, vendorId },
    data: payload,
  });

  return result;
};

const deleteCoupon = async (userInfo: TExtendedUserData, couponId: string) => {
  let isExist;
  if (userInfo.role === "ADMIN") {
    isExist = await prisma.coupon.findUnique({ where: { id: couponId } });
  } else {
    isExist = await prisma.coupon.findUnique({
      where: { id: couponId, vendorId: userInfo?.vendorId as string },
    });
  }
  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "This coupon is not found");
  }

  const result = await prisma.$transaction(async (tsx) => {
    await tsx.productCoupon.deleteMany({ where: { couponId } });
    const deletedData = await tsx.coupon.delete({ where: { id: couponId } });
    return deletedData;
  });
  return result;
};

const getAllCouponOfVendor = async (
  vendorId: string,
  required: "expired" | "running"
) => {
  const coupons = await prisma.coupon.findMany({
    where: {
      vendorId,
      expiryDate:
        required === "expired" ? { lt: new Date() } : { gt: new Date() },
    },
    include: {
      ProductCoupon: {
        include: {
          Product: true,
        },
      },
    },
  });

  return coupons;
};

const getSingleProductAllCoupons = async (productId: string) => {
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!productId) {
    throw new AppError(httpStatus.NOT_FOUND, "This product is not found!");
  } else if (isProductExist?.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "This product is deleted!");
  }
  return await prisma.productCoupon.findMany({
    where: {
      productId,
      Coupon: {
        expiryDate: { gt: new Date() },
      },
    },
    include: { Coupon: true },
  });
};

export const CouponService = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCouponOfVendor,
  getSingleProductAllCoupons,
};
