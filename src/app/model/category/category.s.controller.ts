import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryService } from "./category.service";
import { TImageFile } from "../../interface/image.interface";

const createCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.createCategory(
    req?.body,
    req?.file as TImageFile
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: "Category inserted successfully",
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const result = await CategoryService.getAllCategories();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: "Categories retrived successfully",
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.updateCategory(
    req?.params?.id,
    req?.body,
    req?.file
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: "Category updated successfully",
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.deleteCategory(req?.params?.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: "Category deleted successfully",
  });
});

const deleteAllCategories = catchAsync(async (req, res) => {
  const result = await CategoryService.deleteAllCategories();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: "All categories deleted successfully",
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  deleteAllCategories,
};
