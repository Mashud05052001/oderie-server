import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import config from "../../config";

const registerUser = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await AuthService.registerUser(data, req.file!);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await AuthService.loginUser(data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await AuthService.changePassword(
    req.extendedUserData,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const accessToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.accessToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token retrieved successfully",
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const result = await AuthService.forgetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reset email sent successfully. Please check your email!",
    data: result,
  });
});

const checkResetCode = catchAsync(async (req, res) => {
  const result = await AuthService.checkResetCode(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset code is valid",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await AuthService.resetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      "Password changed successfully. Please login with the new password.",
    data: result,
  });
});

const sendContactEmail = catchAsync(async (req, res) => {
  const result = await AuthService.sendContactEmail(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email send successfully",
    data: result,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  changePassword,
  accessToken,
  forgetPassword,
  checkResetCode,
  resetPassword,
  sendContactEmail,
};
