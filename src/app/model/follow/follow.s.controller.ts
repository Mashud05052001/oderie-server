import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FollowService } from "./follow.service";

const addOrRemoveFollow = catchAsync(async (req, res) => {
  const { result, message } = await FollowService.addOrRemoveFollow(
    req?.extendedUserData,
    req.params?.id
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${message} successfully complete`,
    data: result,
  });
});

const getFollowUsingToken = catchAsync(async (req, res) => {
  const result = await FollowService.getFollowUsingToken(req.extendedUserData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Follow data get successfull`,
    data: result,
  });
});

const getFollowWithoutToken = catchAsync(async (req, res) => {
  const userEmail = (req.query?.userEmail as string) ?? "";

  const { success, result } = await FollowService.getFollowWithoutToken(
    req.params?.id,
    userEmail
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: success as boolean,
    message: `Vendor follow data get successfull`,
    data: result,
  });
});

export const FollowController = {
  addOrRemoveFollow,
  getFollowWithoutToken,
  getFollowUsingToken,
};
