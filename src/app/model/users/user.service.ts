import { Prisma, Profile, Vendor } from "@prisma/client";
import { prisma } from "../../config";
import { TImageFile } from "../../interface/image.interface";
import { TExtendedUserData } from "../../interface/jwt.type";
import pick from "../../utils/pick";
import { TUserFilterItems, TUserUpdate } from "./user.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { TPaginationOptions } from "../../interface/model.type";
import { queryBuilder } from "../../utils/searchBuilder";
import { userSearchableFileds } from "./user.constant";
import { DefaultArgs } from "@prisma/client/runtime/library";

const update = async (
  payload: TUserUpdate,
  userData: TExtendedUserData,
  image: TImageFile | undefined
) => {
  let result;
  if (userData.role === "VENDOR") {
    let vendorUpdatedData: Partial<Vendor> = pick(payload, [
      "address",
      "description",
      "name",
      "phone",
    ]);
    if (image) vendorUpdatedData.logo = image.path;

    result = await prisma.vendor.update({
      where: { email: userData.email },
      data: vendorUpdatedData,
    });
  } else {
    const profileUpdatedData: Partial<Profile> = pick(payload, [
      "address",
      "name",
      "phone",
    ]);
    if (image) profileUpdatedData.img = image.path;

    result = await prisma.profile.update({
      where: { email: userData.email },
      data: profileUpdatedData,
    });
  }

  return result;
};

const blacklistVendor = async (vendorId: string) => {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });

  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, "The vendor is not found");
  }
  let result,
    message = "";
  if (vendor.isBlackListed) {
    result = await prisma.$transaction(async (tsx) => {
      const updateVendor = await tsx.vendor.update({
        where: { id: vendorId },
        data: { isBlackListed: false },
      });
      await tsx.user.update({
        where: { email: vendor.email },
        data: { status: "BLOCKED" },
      });
      message = "User successfully removed from blacklist";
      return updateVendor;
    });
  } else {
    result = await prisma.$transaction(async (tsx) => {
      const updateVendor = await tsx.vendor.update({
        where: { id: vendorId },
        data: { isBlackListed: true },
      });
      await tsx.user.update({
        where: { email: vendor.email },
        data: { status: "ACTIVE" },
      });
      message = "User successfully added to blacklist";
      return updateVendor;
    });
  }

  return { result, message };
};

const getUsers = async (
  role: "VENDOR" | "CUSTOMER",
  filters: TUserFilterItems,
  options: TPaginationOptions,
  // TODO: This will add as my requiredment
  includeObject:
    | Record<keyof Prisma.UserInclude<DefaultArgs>, boolean>
    | undefined
) => {
  let result;
  let andConditions: Prisma.UserWhereInput[] = [{ role }];
  const query = queryBuilder({
    filters,
    pagination: options,
    searchableFields: userSearchableFileds,
    additionalConditions: andConditions,
  });
  if (role === "CUSTOMER") {
    result = await prisma.user.findMany({
      where: (query.where as Prisma.UserWhereInput) || undefined,
      orderBy: query.orderBy,
      skip: query.skip,
      take: query.limit,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        _count: true,
        Follow: { select: { Vendor: true } },
        Order: true,
        Profile: true,
        Review: true,
      },
    });
  } else {
    result = await prisma.user.findMany({
      where: (query.where as Prisma.UserWhereInput) || undefined,
      orderBy: query.orderBy,
      skip: query.skip,
      take: query.limit,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        _count: true,
        Follow: { select: { User: { select: { Profile: true } } } },
        Order: true,
        Review: true,
      },
    });
  }
  return result;
};

const getMe = async (
  includeObject:
    | Record<keyof Prisma.UserInclude<DefaultArgs>, boolean>
    | undefined,
  userInfo: TExtendedUserData
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userInfo.userId, status: "ACTIVE" },
    include: {
      ...includeObject,
      _count: includeObject?._count && userInfo?.role !== "VENDOR" && true,
      Follow: includeObject?.Follow &&
        userInfo?.role !== "VENDOR" && {
          select: { User: true },
        },
      Vendor: includeObject?.Vendor &&
        userInfo?.role === "VENDOR" && {
          include: {
            Follow: {
              select: {
                User: {
                  select: {
                    Profile: {
                      select: {
                        address: true,
                        name: true,
                        email: true,
                        img: true,
                        id: true,
                      },
                    },
                  },
                },
              },
            },
            _count: true,
          },
        },
    },
  });

  delete (user as Record<string, unknown>)?.password;
  delete (user as Record<string, unknown>)?.resetPasswordCode;
  delete (user as Record<string, unknown>)?.resetPasswordExpiredDate;

  return user;
};

const getVendor = async (vendorId: string) => {
  return await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      _count: true,
    },
  });
};

export const UserService = {
  update,
  blacklistVendor,
  getUsers,
  getMe,
  getVendor,
};
