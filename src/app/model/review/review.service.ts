import { Prisma, Product } from "@prisma/client";
import httpStatus from "http-status";
import { prisma } from "../../config";
import AppError from "../../errors/AppError";
import { TImageFile } from "../../interface/image.interface";
import { TExtendedUserData } from "../../interface/jwt.type";
import { TPaginationOptions } from "../../interface/model.type";
import { returnMetaData } from "../../shared/returnMetaData";
import { queryBuilder } from "../../utils/searchBuilder";
import { TCreateReview } from "./review.interface";

const getSingleProductReview = async (
  productId: string,
  options: TPaginationOptions
) => {
  const andCondition: Prisma.ReviewWhereInput[] = [{ isDeleted: false }];
  const query = queryBuilder({
    pagination: options,
    additionalConditions: andCondition,
  });
  const result = await prisma.review.findMany({
    where: { productId },
    orderBy: query.orderBy,
    skip: query.skip,
    take: query.limit,
    include: {
      VendorResponse: true,
      User: { select: { id: true, Profile: true } },
    },
  });

  const total = await prisma.review.count({ where: { productId } });
  return returnMetaData(total, query, result);
};

const createReview = async (
  userInfo: TExtendedUserData,
  payload: TCreateReview,
  imgFile: TImageFile | undefined
) => {
  const { orderId, ...others } = payload;

  const productData = await prisma.product.findUniqueOrThrow({
    where: { id: payload.productId },
    include: { _count: true, Vendor: true },
  });

  const reviewData = {
    userId: userInfo.userId,
    productImg: imgFile ? imgFile.path : "",
    orderId,
    vendorId: productData?.Vendor?.id,
    ...others,
  };

  const isReviewExist = await prisma.review.findFirst({
    // where: { userId: userInfo.userId, productId: payload.productId },
    where: { userId: userInfo.userId, productId: payload.productId, orderId },
  });

  if (isReviewExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot review on a product multiple time"
    );
  }

  const orderInfo = await prisma.order.findUnique({
    where: {
      id: orderId,
      userId: userInfo.userId,
      paymentStatus: "PAID",
      status: { in: ["PROCESSING", "DELIVERED"] },
    },
    include: { OrderItem: true },
  });
  if (!orderInfo) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Order not found. Please contact with us."
    );
  } else if (orderInfo?.status === "PROCESSING") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only give order after successfully received the product."
    );
  }
  const isProductReallyOrderedBySameUser = orderInfo.OrderItem.find(
    (item) => item.productId === payload.productId
  );
  if (!isProductReallyOrderedBySameUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot review on a product which you won't order it"
    );
  }

  const productPrevReviewCount = productData._count.Review;
  const productTotalRatings =
    (productData.ratings * productPrevReviewCount + payload.ratings) /
    (productPrevReviewCount + 1);
  const vendorPrevRatingCount = productData?.Vendor?.ratingsCount;
  const vendorPrevRatings = productData?.Vendor?.ratings;
  const updatedVendorRatings =
    (vendorPrevRatings * vendorPrevRatingCount + payload.ratings) /
    (vendorPrevRatingCount + 1);

  const result = await prisma.$transaction(async (tsx) => {
    await tsx.product.update({
      where: { id: payload.productId },
      data: { ratings: productTotalRatings },
    });
    await tsx.vendor.update({
      where: { id: productData?.vendorId },
      data: {
        ratingsCount: { increment: 1 },
        ratings: updatedVendorRatings,
      },
    });
    return await tsx.review.create({ data: reviewData });
  });

  return result;
};

const updateReview = async (
  reviewId: string,
  payload: Pick<TCreateReview, "message" | "ratings">,
  userInfo: TExtendedUserData
) => {
  prisma.review.findUniqueOrThrow({
    where: { id: reviewId, userId: userInfo.userId },
  });
  return await prisma.review.update({
    where: { id: reviewId, userId: userInfo.userId },
    data: payload,
  });
};

// customer | admin can delete
const deleteReview = async (reviewId: string, userInfo: TExtendedUserData) => {
  if (userInfo.role === "CUSTOMER") {
    await prisma.review.findUniqueOrThrow({
      where: { id: reviewId, userId: userInfo.userId },
    });
  }
  await prisma.review.update({
    where: { id: reviewId },
    data: { isDeleted: true },
  });

  return "Review deleted successfully";
};

// Customer | Vendor
const getMyAllReviews = async (
  userInfo: TExtendedUserData,
  paginateOptions: TPaginationOptions,
  options: Record<string, unknown>
) => {
  const userRole = userInfo?.role;
  const andCondition: Prisma.ReviewWhereInput[] = [
    userRole === "CUSTOMER"
      ? { userId: userInfo?.userId }
      : { vendorId: userInfo?.vendorId! },
  ];
  if (userRole === "VENDOR" && options?.isVendorResponse) {
    if (options?.isVendorResponse === "true") {
      andCondition.push({ NOT: { VendorResponse: null } });
    } else if (options?.isVendorResponse === "false") {
      andCondition.push({ VendorResponse: null });
    }
    delete options?.isVendorResponse;
  }

  const query = queryBuilder({
    filters: options,
    pagination: paginateOptions,
    additionalConditions: andCondition,
  });

  const result = await prisma.review.findMany({
    where: query?.where,
    include: {
      Product: true,
      // VendorResponse: true,
      VendorResponse: { where: { isDeleted: false } },
      User: userInfo?.role === "VENDOR" ? { select: { Profile: true } } : false,
    },
    skip: query?.skip,
    take: query?.limit,
    orderBy: query?.orderBy,
  });
  const total = await prisma.review.count({
    where: query?.where,
  });

  return returnMetaData(total, query, result);
};

const getReviewedProductInfo = async (userInfo: TExtendedUserData) => {
  const vendorId = userInfo?.vendorId!;
  const result = await prisma.review.findMany({
    where: { vendorId },
    distinct: ["productId"],
    select: {
      productId: true,
      Product: {
        select: {
          title: true,
          Category: { select: { name: true, icon: true } },
          img: true,
        },
      },
    },
  });
  const alreadyReviewdProducts: Partial<Product>[] = result.map((item) => ({
    id: item.productId,
    title: item?.Product?.title,
    img: item?.Product?.img,
    Category: item?.Product?.Category,
  }));
  const ids: string[] = [];
  alreadyReviewdProducts.forEach((item) => ids.push(item.id!));
  const otherProducts = await prisma.product.findMany({
    where: { vendorId, id: { notIn: ids } },
    select: {
      id: true,
      title: true,
      img: true,
      Category: { select: { icon: true, name: true } },
    },
  });
  console.log(otherProducts.length);
  return [...alreadyReviewdProducts, ...otherProducts];
};

export const ReviewService = {
  getSingleProductReview,
  createReview,
  updateReview,
  deleteReview,
  getMyAllReviews,
  getReviewedProductInfo,
};
