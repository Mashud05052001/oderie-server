import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CouponService } from "./coupon.service";
import pick from "../../utils/pick";
import { paginateProps } from "../../constant/model.constant";

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
const deleteCouponProduct = catchAsync(async (req, res) => {
  const result = await CouponService.deleteCouponProduct(
    req.extendedUserData,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon product deleted successfully",
    data: result,
  });
});

const getAllCouponOfVendor = catchAsync(async (req, res) => {
  const options = pick(req?.query, paginateProps);
  const required = req.query?.required === "expired" ? "expired" : "running";
  const userInfo = req?.extendedUserData;
  const vendorId =
    userInfo?.role === "VENDOR" ? userInfo?.vendorId! : req?.params?.id;
  const result = await CouponService.getAllCouponOfVendor(
    vendorId,
    required,
    options
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
  deleteCouponProduct,
  getAllCouponOfVendor,
  getSingleProductAllCoupons,
};
