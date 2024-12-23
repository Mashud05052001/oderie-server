import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import { jwtHelper } from "../utils/jwtHelper";
import { UserRole, UserStatus } from "@prisma/client";
import AppError from "../errors/AppError";
import { prisma } from "../config";

/* AUTH Middleware */

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = (req?.headers?.authorization as string)?.split(" ")[1];
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token is missing!");
    }

    const decoded = jwtHelper.verifyAccessToken(token) as JwtPayload;

    if (requiredRoles && !requiredRoles.includes(decoded?.role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
    }

    // DO user related work here
    const userData = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { Profile: true },
    });

    if (!userData) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not found!");
    } else if (userData.status === "BLOCKED" || userData.status === "DELETED") {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        `User has been ${userData.status}`
      );
    }

    if (decoded.role !== userData.role) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Authorization Failed due to invalid token"
      );
    }

    let vendorProfile;
    const isVendorData = userData.role === "VENDOR";

    if (userData.role === "VENDOR") {
      vendorProfile = await prisma.vendor.findUnique({
        where: { email: userData.email },
      });
      if (vendorProfile?.isBlackListed) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "This vendor profile has been blacklisted"
        );
      }
    }

    req.user = decoded as JwtPayload;
    req.extendedUserData = {
      email: userData.email,
      password: userData?.password || "",
      role: userData.role,
      status: userData.status,
      userId: userData.id,
      vendorId: vendorProfile ? vendorProfile.id : null,
      profilePicture: isVendorData
        ? vendorProfile?.logo ?? ""
        : userData?.Profile?.img ?? "",
      name: isVendorData
        ? vendorProfile?.name ?? ""
        : userData?.Profile?.name ?? "",
    };

    next();
  });
};

export default auth;
