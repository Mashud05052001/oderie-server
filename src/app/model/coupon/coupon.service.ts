import { Coupon, Prisma, ProductCoupon } from "@prisma/client";
import { TExtendedUserData } from "../../interface/jwt.type";
import { TCouponCreate } from "./coupon.interface";
import { generateRandomCode } from "../../shared/generateResetCode";
import { prisma } from "../../config";
import AppError from "../../errors/AppError";
import httpStatus, { BAD_REQUEST } from "http-status";
import { returnMetaData } from "../../shared/returnMetaData";
import { TPaginationOptions } from "../../interface/model.type";
import { queryBuilder } from "../../utils/searchBuilder";

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
  const couponCode = payload?.code || generateRandomCode(6);
  const isSameCouponValidCodeExist = await prisma.coupon.findFirst({
    where: {
      code: couponCode,
      expiryDate: {
        gt: new Date(),
      },
    },
  });
  console.log(isSameCouponValidCodeExist);
  if (isSameCouponValidCodeExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already created a coupon with same code. Please try with a different code"
    );
  }

  const productIds = payload.productIds;

  const couponData = {
    code: couponCode,
    expiryDate: payload.expiryDate,
    percentage: payload.percentage,
    vendorId: userInfo.vendorId as string,
  };

  const allProductsOfTheVendor = await prisma.product.findMany({
    where: {
      vendorId: userInfo.vendorId as string,
      isDeleted: false,
      id: { in: payload.productIds },
    },
    select: { id: true, img: true, title: true },
  });

  if (productIds.length !== allProductsOfTheVendor.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Something went wrong. Please try again after sometime"
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

const deleteCouponProduct = async (
  userInfo: TExtendedUserData,
  payload: { productId: string; couponId: string }
) => {
  let isExist;
  if (userInfo.role === "ADMIN") {
    isExist = await prisma.coupon.findUnique({
      where: {
        id: payload.couponId,
        ProductCoupon: { some: { productId: payload.productId } },
      },
      include: { _count: true },
    });
  } else {
    isExist = await prisma.coupon.findUnique({
      where: {
        id: payload.couponId,
        vendorId: userInfo?.vendorId as string,
        ProductCoupon: { some: { productId: payload.productId } },
      },
      include: { _count: true },
    });
  }
  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "This product is not found");
  }
  const result = await prisma.productCoupon.delete({
    where: {
      productId_couponId: {
        couponId: payload.couponId,
        productId: payload.productId,
      },
    },
  });

  return result;
};

const getAllCouponOfVendor = async (
  vendorId: string,
  required: "expired" | "running",
  pagination: TPaginationOptions
) => {
  const additionalConditions: Prisma.CouponWhereInput[] = [
    {
      vendorId,
      expiryDate:
        required === "expired" ? { lt: new Date() } : { gt: new Date() },
    },
  ];

  const query = queryBuilder({ pagination, additionalConditions });

  const coupons = await prisma.coupon.findMany({
    where: query?.where,
    include: {
      ProductCoupon: {
        include: {
          Product: true,
        },
      },
    },
    orderBy: {
      expiryDate: "desc",
    },
    skip: query?.skip,
    take: query?.limit,
  });

  const total = await prisma.coupon.count({ where: query?.where });

  return returnMetaData(total, query, coupons);
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
  deleteCouponProduct,
};
