import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import { jwtHelper } from "../utils/jwtHelper";
import { UserRole, UserStatus } from "@prisma/client";
import AppError from "../errors/AppError";
import { prisma } from "../config";

/* AUTH Middleware */

const authDecodeToken = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = (req?.headers?.authorization as string)?.split(" ")[1];
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token is missing!");
    }
    const decoded = jwtHelper.verifyAccessToken(token) as JwtPayload;

    // DO user related work here
    const userData = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { Vendor: true },
    });
    if (!userData) {
      return next();
    } else if (userData.status === "BLOCKED" || userData.status === "DELETED") {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        `User has been ${userData.status}`
      );
    }
    let vendorId =
      userData.role === "VENDOR" ? (userData?.Vendor?.id as string) : null;

    req.user = decoded as JwtPayload;

    req.extendedUserData = {
      email: userData.email,
      password: "",
      role: userData.role,
      status: userData.status,
      userId: userData.id,
      vendorId: vendorId,
      profilePicture: "",
      name: "",
    };

    next();
  });
};

export default authDecodeToken;
