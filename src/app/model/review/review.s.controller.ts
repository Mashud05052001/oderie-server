import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./review.service";
import pick from "../../utils/pick";
import { paginateProps } from "../../constant/model.constant";

const getMyAllReviews = catchAsync(async (req, res, next) => {
  const paginateOptions = pick(req.query, paginateProps);
  const options = pick(req.query, ["isVendorResponse", "productId"]);

  const result = await ReviewService.getMyAllReviews(
    req?.extendedUserData,
    paginateOptions,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All reviews retrieved successfull",
    data: result,
  });
});
const getReviewedProductInfo = catchAsync(async (req, res, next) => {
  const options = pick(req.query, ["isVendorResponse", "productId"]);

  const result = await ReviewService.getReviewedProductInfo(
    req?.extendedUserData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All reviewed products retrieved successfull",
    data: result,
  });
});

const getSingleProductReview = catchAsync(async (req, res, next) => {
  const options = pick(req.query, paginateProps);
  const result = await ReviewService.getSingleProductReview(
    req.params?.id,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All reviews retrieved successfully of the product",
    data: result,
  });
});

const createReview = catchAsync(async (req, res, next) => {
  const result = await ReviewService.createReview(
    req.extendedUserData,
    req.body,
    req.file || undefined
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req, res, next) => {
  const result = await ReviewService.updateReview(
    req.params?.id,
    req.body,
    req.extendedUserData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});
const deleteReview = catchAsync(async (req, res, next) => {
  const result = await ReviewService.deleteReview(
    req.params?.id,
    req.extendedUserData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  getMyAllReviews,
  getReviewedProductInfo,
  getSingleProductReview,
  createReview,
  updateReview,
  deleteReview,
};
