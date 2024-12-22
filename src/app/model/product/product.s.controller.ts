import httpStatus from "http-status";
import { TImageFiles } from "../../interface/image.interface";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductService } from "./product.service";
import pick, { pickIncludeObject } from "../../utils/pick";
import { Prisma } from "@prisma/client";
import {
  allProductIncludes,
  paginateProps,
  singleProductIncludes,
} from "../../constant/model.constant";
import { productFilterableFields } from "./product.constant";
import { TProductFilterItems } from "./product.interface";

const createProduct = catchAsync(async (req, res) => {
  const result = await ProductService.createProduct(
    req.body,
    req.extendedUserData,
    req.files as TImageFiles
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product is created successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const productIds = req.query?.productIds as string;
  const options = pick(req.query, paginateProps);
  const filters = pick(req.query, productFilterableFields);

  const includeObject = pickIncludeObject<Prisma.ProductInclude>(
    allProductIncludes,
    req.query?.includes as string
  );
  const isProductCouponInclude =
    typeof req.query?.includes === "string" &&
    req.query.includes.toLowerCase().includes("productcoupon");

  const result = await ProductService.getAllProducts(
    req?.extendedUserData,
    filters as TProductFilterItems,
    options,
    includeObject,
    isProductCouponInclude,
    productIds
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Products are retrieved successfully",
    data: result,
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
  const includeObject = pickIncludeObject<Prisma.ProductInclude>(
    singleProductIncludes,
    req.query?.includes as string
  );

  const result = await ProductService.getSingleProduct(
    req.params?.id,
    includeObject
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product is retrieved successfully",
    data: result,
  });
});
/*
Must have to provide other remainig images if you update / add pictures using form data
*/
const updateProduct = catchAsync(async (req, res) => {
  const productId = req.params?.id;
  const userData = req?.extendedUserData;
  const images = req?.files as TImageFiles | undefined;

  const result = await ProductService.updateProduct(
    productId,
    req.body,
    userData,
    images
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product is updated successfully",
    data: result,
  });
});

const duplicateProduct = catchAsync(async (req, res) => {
  const productId = req.params?.id;
  const userData = req?.extendedUserData;

  const result = await ProductService.duplicateProduct(productId, userData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Duplicate product created successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const result = await ProductService.deleteProduct(
    req.params?.id,
    req.extendedUserData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product is deleted successfully",
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
};
