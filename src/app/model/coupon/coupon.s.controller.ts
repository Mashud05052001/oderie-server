import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CouponService } from "./coupon.service";

const createCoupon = catchAsync(async (req, res) => {
  const result = await CouponService.createCoupon(
    req.extendedUserData,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon created successfully",
    data: result,
  });
});

const updateCoupon = catchAsync(async (req, res) => {
  const result = await CouponService.updateCoupon(
    req.extendedUserData,
    req?.body,
    req.params?.id
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon updated successfully",
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req, res) => {
  const result = await CouponService.deleteCoupon(
    req.extendedUserData,
    req.params.id
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon deleted successfully",
    data: result,
  });
});

const getAllCouponOfVendor = catchAsync(async (req, res) => {
  const required = req.query?.required === "expired" ? "expired" : "running";
  const result = await CouponService.getAllCouponOfVendor(
    req.params.id,
    required
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendor all coupons retrieved successfully",
    data: result,
  });
});

const getSingleProductAllCoupons = catchAsync(async (req, res) => {
  const result = await CouponService.getSingleProductAllCoupons(req.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupons on a single product retrieved successfull",
    data: result,
  });
});

export const CouponController = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCouponOfVendor,
  getSingleProductAllCoupons,
};
