import httpStatus from "http-status";
import { prisma } from "../../config";
import AppError from "../../errors/AppError";
import { TExtendedUserData } from "../../interface/jwt.type";
import { userInfo } from "os";

// Only user can follow or unfollow any vendor
const addOrRemoveFollow = async (
  userData: TExtendedUserData,
  vendorId: string
) => {
  const isVendorExist = await prisma.vendor.findUnique({
    where: { id: vendorId, isBlackListed: false },
    include: { Follow: { select: { userId: true } } },
  });
  if (!isVendorExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Vandor not found or blacklisted by admin"
    );
  }

  const isAlreadyFollow = isVendorExist.Follow.map(
    (item) => item.userId
  ).includes(userData.userId);
  let message: "Follow" | "Unfollow" = "Follow";
  if (isAlreadyFollow) {
    // Unfollow the store
    await prisma.follow.delete({
      where: { userId_vendorId: { vendorId, userId: userData.userId } },
    });
    message = "Unfollow";
  } else {
    // Follow the store
    await prisma.follow.create({
      data: { userId: userData.userId, vendorId },
    });
  }
  const result = await prisma.user.findUnique({
    where: { id: userData.userId },
    include: { Follow: true, Profile: true },
  });
  return { result, message };
};

const getFollowUsingToken = async (userData: TExtendedUserData) => {
  let result;
  if (userData.role === "VENDOR") {
    result = await prisma.vendor.findUnique({
      where: { email: userData?.email },
      include: { Follow: true, _count: true },
    });
  } else if (userData.role === "CUSTOMER") {
    result = await prisma.follow.findMany({
      where: { userId: userData?.userId },
      include: { Vendor: true },
    });
  } else {
    result = await prisma.follow.findMany({
      include: {
        Vendor: true,
        User: {
          select: { Profile: true },
        },
      },
    });
  }

  return result;
};

const getFollowWithoutToken = async (vendorId: string) => {
  const vendorData = await prisma.vendor.findUnique({
    where: { id: vendorId, isBlackListed: false },
    include: { Follow: true },
  });
  if (!vendorData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Vandor not found or blacklisted by admin"
    );
  }
  return vendorData;
};

export const FollowService = {
  addOrRemoveFollow,
  getFollowUsingToken,
  getFollowWithoutToken,
};
