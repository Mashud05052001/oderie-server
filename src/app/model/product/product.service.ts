import { Prisma, Product } from "@prisma/client";
import { TImageFiles } from "../../interface/image.interface";
import { TExtendedUserData } from "../../interface/jwt.type";
import {
  TProductCreate,
  TProductFilterItems,
  TProductUpdate,
} from "./product.interface";
import { prisma } from "../../config";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { TInclude, TPaginationOptions } from "../../interface/model.type";
import { queryBuilder } from "../../utils/searchBuilder";
import { productSearchableFields } from "./product.constant";
import { calculateRange } from "../../shared/calculateRange";
import { returnMetaData } from "../../shared/returnMetaData";
import { equal } from "assert";

const createProduct = async (
  payload: TProductCreate,
  vendorData: TExtendedUserData,
  images: TImageFiles
) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId, isDeleted: false },
  });
  if (!category) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "The category is not available or deleted by admin"
    );
  }
  const productData = {
    ...payload,
    vendorId: vendorData.vendorId as string,
    img: images.files.map((imgInfo) => imgInfo.path),
  };

  const result = await prisma.product.create({ data: productData });
  return result;
};

const getAllProducts = async (
  loginUserData: TExtendedUserData | null,
  filters: TProductFilterItems,
  paginateOptions: TPaginationOptions,
  includeObj: TInclude,
  isProductCouponInclude: boolean
) => {
  const andConditions: Prisma.ProductWhereInput[] = [];

  if (filters?.price) {
    const priceObj = calculateRange(filters.price);
    andConditions.push({
      price: priceObj,
    });
  }
  // Vendor can get hit all data from here
  if (loginUserData?.vendorId) {
    andConditions.push({ vendorId: loginUserData?.vendorId });
  }
  if (
    (loginUserData?.vendorId && filters.isDeleted === "true") ||
    (loginUserData?.role === "ADMIN" && filters.isDeleted === "true")
  ) {
    andConditions.push({ isDeleted: true });
  } else {
    andConditions.push({ isDeleted: false });
  }

  const query = queryBuilder({
    filters,
    pagination: paginateOptions,
    searchableFields: productSearchableFields,
    additionalConditions: andConditions,
  });

  let userFollowedVendorIds: string[] = [];
  if (loginUserData && loginUserData?.userId) {
    const result = await prisma.follow.findMany({
      where: { userId: loginUserData.userId },
      orderBy: { updatedAt: "desc" },
    });
    result.forEach((item) => userFollowedVendorIds.push(item.vendorId));
  }

  const result = await prisma.product.findMany({
    where: {
      ...query.where,
    },
    include: {
      ...includeObj,
      ...(isProductCouponInclude && {
        ProductCoupon: {
          where: {
            Coupon: {
              expiryDate: {
                gte: new Date(),
              },
            },
          },
          select: {
            Coupon: true,
          },
        },
      }),
    },
    skip: query.skip,
    take: query.limit,
    orderBy: query.orderBy,
  });

  const total = await prisma.product.count({
    where: query.where,
  });

  return returnMetaData(total, query, result);
};

const duplicateProduct = async (
  productId: string,
  userInfo: TExtendedUserData
) => {
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!isProductExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product doesn't found!");
  } else if (isProductExist.vendorId !== userInfo?.vendorId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot duplicate another vendor product"
    );
  }
  const duplicateProductData = {
    categoryId: isProductExist.categoryId,
    description: isProductExist.description,
    img: isProductExist.img,
    price: isProductExist.price,
    quantity: isProductExist.quantity,
    title: isProductExist.title,
    vendorId: isProductExist.vendorId,
  };
  return await prisma.product.create({ data: duplicateProductData });
};

const getSingleProduct = async (
  id: string,
  includeObj: TInclude,
  isProductCouponInclude: boolean
) => {
  const result = await prisma.product.findUnique({
    where: { id, isDeleted: false },
    include: {
      // ...includeObj,
      // ...(isProductCouponInclude && {
      //   ProductCoupon: {
      //     where: {
      //       Coupon: {
      //         expiryDate: {
      //           gte: new Date(),
      //         },
      //       },
      //     },
      //     select: {
      //       Coupon: true,
      //     },
      //   },
      // }),
      Review: {
        include: {
          VendorResponse: true,
        },
      },
      Vendor: {
        include: {
          _count: true,
        },
      },
      _count: true,
      Category: true,
      Order: true,
      ProductCoupon: {
        where: {
          Coupon: {
            expiryDate: {
              gte: new Date(),
            },
          },
        },
        select: {
          Coupon: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "The product is missiong or deleted"
    );
  }

  return result;
};

const updateProduct = async (
  productId: string,
  payload: TProductUpdate,
  userData: TExtendedUserData,
  images: TImageFiles | undefined
) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(httpStatus.BAD_REQUEST, "The product is not found");
  } else if (product.isDeleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "The product is deleted. Please restore it to update"
    );
  } else if (userData.vendorId !== product.vendorId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot update other vendor's data"
    );
  }
  const updatedData: Partial<Product> = { ...payload };
  if (images) {
    const imagesURL: string[] = [];
    if (payload?.img) payload.img.forEach((image) => imagesURL.push(image));
    images.files.forEach((image) => imagesURL.push(image.path));
    updatedData.img = imagesURL;
  }
  if (payload?.categoryId && payload?.categoryId !== product?.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload?.categoryId, isDeleted: false },
    });
    if (!category) {
      throw new AppError(httpStatus.BAD_REQUEST, "This category is not found!");
    }
  }

  const result = await prisma.product.update({
    where: { id: productId },
    data: updatedData,
  });

  return result;
};

const deleteProduct = async (id: string, userInfo: TExtendedUserData) => {
  const isProductExist = await prisma.product.findUnique({ where: { id } });
  if (!isProductExist) {
    throw new AppError(httpStatus.NOT_FOUND, "The product is not found.");
  } else if (isProductExist.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "The product is already deleted.");
  }
  if (
    userInfo.role === "VENDOR" &&
    userInfo.vendorId !== isProductExist.vendorId
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A vendor cannot delete another vendor product"
    );
  }
  const result = await prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });
  return result;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct,
};
