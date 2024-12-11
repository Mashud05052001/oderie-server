import httpStatus from "http-status";
import { prisma } from "../../config";
import AppError from "../../errors/AppError";
import { TImageFile } from "../../interface/image.interface";
import { TExtendedUserData } from "../../interface/jwt.type";
import { TPaginationOptions } from "../../interface/model.type";
import { returnMetaData } from "../../shared/returnMetaData";
import { queryBuilder } from "../../utils/searchBuilder";
import { TCreateReview } from "./review.interface";
import { Prisma } from "@prisma/client";

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
  const reviewData = {
    ...others,
    userId: userInfo.userId,
    productImg: imgFile ? imgFile.path : "",
  };
  const isExist = await prisma.review.findFirst({
    where: { userId: userInfo.userId, productId: payload.productId },
  });
  if (isExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot review on a product multiple time"
    );
  }

  await prisma.product.findUniqueOrThrow({
    where: { id: payload.productId },
  });
  const orderInfo = await prisma.order.findUniqueOrThrow({
    where: {
      id: orderId,
      userId: userInfo.userId,
      paymentStatus: "PAID",
      status: "DELIVERED",
    },
    include: { OrderItem: true },
  });
  const isProductReallyOrderedBySameUser = orderInfo.OrderItem.find(
    (item) => item.productId === payload.productId
  );
  if (!isProductReallyOrderedBySameUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot review on a product which you won't order it"
    );
  }
  const review = await prisma.review.create({ data: reviewData });

  return review;
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

export const ReviewService = {
  getSingleProductReview,
  createReview,
  updateReview,
  deleteReview,
};
