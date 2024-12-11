import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { VendorResponseService } from "./vendorResponse.service";

const create = catchAsync(async (req, res) => {
  const result = await VendorResponseService.create(
    req.body,
    req.extendedUserData
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Vendor response created successfully",
    data: result,
  });
});

const update = catchAsync(async (req, res) => {
  const result = await VendorResponseService.update(
    req.params?.id,
    req.body,
    req.extendedUserData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendor response updated successfully",
    data: result,
  });
});

const deleteVendorResponse = catchAsync(async (req, res) => {
  const result = await VendorResponseService.deleteVendorResponse(
    req.params?.id,
    req.extendedUserData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendor response deleted successfully",
    data: result,
  });
});

export const VendorResponseController = {
  create,
  update,
  deleteVendorResponse,
};
