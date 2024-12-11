import httpStatus from "http-status";
import { prisma } from "../../config";
import AppError from "../../errors/AppError";
import { TExtendedUserData } from "../../interface/jwt.type";
import { TCreateVendorResponse } from "./vendorResponse.interface";

const create = async (
  payload: TCreateVendorResponse,
  userInfo: TExtendedUserData
) => {
  await prisma.review.findUniqueOrThrow({
    where: { id: payload.reviewId, isDeleted: false },
  });
  const isAlreadyResponsed = await prisma.vendorResponse.findFirst({
    where: { reviewId: payload.reviewId, isDeleted: false },
  });
  if (isAlreadyResponsed) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can't response a review twice"
    );
  }
  const responseData = {
    message: payload.message,
    reviewId: payload.reviewId,
    vendorId: userInfo.vendorId as string,
  };
  const result = await prisma.vendorResponse.create({ data: responseData });
  return result;
};

const update = async (
  vendorResponseId: string,
  payload: Pick<TCreateVendorResponse, "message">,
  userInfo: TExtendedUserData
) => {
  await prisma.vendorResponse.findUniqueOrThrow({
    where: { id: vendorResponseId, vendorId: userInfo?.vendorId as string },
  });

  const result = await prisma.vendorResponse.update({
    where: { id: vendorResponseId },
    data: { message: payload.message },
  });
  return result;
};

// ADMIN | VENDOR
const deleteVendorResponse = async (
  vendorResponseId: string,
  userInfo: TExtendedUserData
) => {
  const vendorResponse = await prisma.vendorResponse.findUniqueOrThrow({
    where: { id: vendorResponseId },
  });
  if (
    userInfo.role === "VENDOR" &&
    vendorResponse.vendorId !== userInfo?.vendorId
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot delete another vendor response"
    );
  }

  const result = await prisma.vendorResponse.update({
    where: { id: vendorResponseId },
    data: { isDeleted: true },
  });
  return result;
};

export const VendorResponseService = {
  create,
  update,
  deleteVendorResponse,
};
