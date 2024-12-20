import { Prisma, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import { allUserIncludes, paginateProps } from "../../constant/model.constant";
import catchAsync from "../../utils/catchAsync";
import pick, { pickIncludeObject } from "../../utils/pick";
import sendResponse from "../../utils/sendResponse";
import { userFilterableFileds } from "./user.constant";
import { TUserFilterItems } from "./user.interface";
import { UserService } from "./user.service";

const update = catchAsync(async (req, res) => {
  const result = await UserService.update(
    req?.body,
    req?.extendedUserData,
    req?.file
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Name is created successfully",
    data: result,
  });
});

const blacklistVendor = catchAsync(async (req, res) => {
  const { result, message } = await UserService.blacklistVendor(req?.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: message,
    data: result,
  });
});

const getUser = catchAsync(async (req, res) => {
  let requiredRole: UserRole = "CUSTOMER";

  if ((req.query?.role as UserRole).toLowerCase() === "vendor")
    requiredRole = "VENDOR";
  const options = pick(req?.query, paginateProps);
  const filters = pick(req?.query, userFilterableFileds) as TUserFilterItems;
  const includeObject = pickIncludeObject<Prisma.UserInclude>(
    allUserIncludes,
    req.query?.includes as string
  );
  const result = await UserService.getUsers(
    requiredRole,
    filters,
    options,
    includeObject
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `All ${requiredRole.toLowerCase()} data fetched successfully`,
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const includeObject = pickIncludeObject<Prisma.UserInclude>(
    allUserIncludes,
    req.query?.includes as string
  );
  const result = await UserService.getMe(includeObject, req?.extendedUserData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `My data fetched successfully`,
    data: result,
  });
});

const getVendor = catchAsync(async (req, res) => {
  const result = await UserService.getVendor(req.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Vendor data fetched successfully`,
    data: result,
  });
});

export const UserController = {
  update,
  blacklistVendor,
  getUser,
  getMe,
  getVendor,
};
