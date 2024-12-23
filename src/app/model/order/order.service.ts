import { OrderStatus, Prisma, UserRole } from "@prisma/client";
import { Response } from "express";
import httpStatus from "http-status";
import { prisma } from "../../config";
import AppError from "../../errors/AppError";
import { TExtendedUserData } from "../../interface/jwt.type";
import sendResponse from "../../utils/sendResponse";
import { TCreateOrder, TInvalidProduct } from "./order.interface";
import { TPaginationOptions } from "../../interface/model.type";
import { queryBuilder } from "../../utils/searchBuilder";
import { returnMetaData } from "../../shared/returnMetaData";
import { initiatePayment } from "../payment/payment.utils";

/*
- Validate the vendor: check if it exists, is not blacklisted, and is active
- Ensure all requested products exist in the database
- Compare requested quantities with available quantities
- Identify products where the requested quantity exceeds the available quantity & return error response
- Use a database transaction to:
    1. Create the order
    2. Create order items for each product
    3. Update product quantities in the database
    4. Initiate Payment

*/

const createOrder = async (
  payload: TCreateOrder,
  res: Response,
  userInfo: TExtendedUserData
) => {
  const { products, cancleUrl, ...othersData } = payload;
  const orderData = {
    ...othersData,
    userId: userInfo?.userId,
  };

  const vendorData = await prisma.vendor.findUnique({
    where: {
      id: payload.vendorId,
      isBlackListed: false,
      User: { status: "ACTIVE" },
    },
  });
  if (!vendorData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This vendor has some issue. Currently you cannot purchased any product from this vendor"
    );
  }
  const productIds = products.map((item) => item.productId);
  const productsInfo = await prisma.product.findMany({
    where: { id: { in: productIds }, isDeleted: false },
    select: { id: true, quantity: true, title: true },
  });
  if (products.length !== productsInfo.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Something went wrong. Please clear cart & reorder"
    );
  }

  const invalidProducts = products.reduce<TInvalidProduct[]>((acc, product) => {
    const matchingProduct = productsInfo.find(
      (info) => info.id === product.productId
    );
    if (matchingProduct && product.quantity > matchingProduct.quantity) {
      acc.push({
        id: matchingProduct.id,
        title: matchingProduct.title,
        requestedQuantity: product.quantity,
        availableQuantity: matchingProduct.quantity,
      });
    }
    return acc;
  }, []);

  if (invalidProducts.length > 0) {
    return { result: invalidProducts, success: false };
  }
  // Create order, it's corresponding orderItem & update product quantity
  const result = await prisma.$transaction(async (tsx) => {
    const order = await tsx.order.create({ data: orderData });
    const orderItemData = products.map((item) => ({
      quantity: item.quantity,
      productId: item.productId,
      orderId: order.id,
    }));
    await tsx.orderItem.createMany({ data: orderItemData });
    await Promise.all(
      products.map(async (item) => {
        await tsx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      })
    );
    const paymentData = await initiatePayment(
      { orderId: order.id, cancleUrl: payload.cancleUrl },
      userInfo,
      orderData.totalPrice
    );
    return { order, paymentData };
  });

  return { result, success: true };
};

// Used for canceled status for user end, delivered for vendorEnd. Processing will be on when payment success

const changeOrderStatus = async (
  orderId: string,
  userInfo: TExtendedUserData,
  payload: { status: "DELIVERED" | "CANCELLED" }
) => {
  if (userInfo.role === "VENDOR" && payload.status === "CANCELLED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Vendor cannot cancle a product"
    );
  } else if (userInfo.role === "CUSTOMER" && payload.status === "DELIVERED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Customer cannot change a product status delivered"
    );
  }
  if (userInfo.role !== "VENDOR" && payload.status === "DELIVERED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only vendor can change the status to delivered"
    );
  }
  const isOrderExist = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!isOrderExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "This order is not found");
  }
  if (isOrderExist.paymentStatus !== "PAID" && payload.status === "DELIVERED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Order status only set delivered after payment successfully paid"
    );
  }
  let result;
  if (payload.status === "CANCELLED") {
    result = await prisma.$transaction(async (tsx) => {
      const orderItems = await tsx.orderItem.findMany({ where: { orderId } });
      Promise.all(
        orderItems.map(async (orderItem) => {
          await tsx.product.updateMany({
            where: { id: orderItem.productId },
            data: { quantity: { increment: orderItem.quantity } },
          });
        })
      );
      const order = await tsx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
      return order;
    });
  } else {
    result = await prisma.order.update({
      where: { id: orderId },
      data: { status: "DELIVERED" },
    });
  }
  return result;
};

/* Filter =>  searchTerm, vendorId(admin), status, paymentStatus
ADMIN => Can see all orders
CUSTOMER => Can see only it's orders
VENDOR => Can see only it's orders. For vendor in query if vendorId found it returns error
*/
const getAllOrders = async (
  userData: TExtendedUserData,
  filters: any,
  options: TPaginationOptions
) => {
  const andConditions: Prisma.OrderWhereInput[] = [];
  if (filters?.vendorId && userData?.role === "VENDOR") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A vendor cannot get another's data"
    );
  }
  // Add search term filter if provided

  if (filters?.searchTerm && userData.role !== "CUSTOMER") {
    andConditions.push({
      User: {
        Profile: {
          name: {
            contains: filters.searchTerm as string,
            mode: "insensitive",
          },
        },
      },
    });
  }

  // Add vendor-specific condition if the role is "VENDOR"
  if (userData.role === "VENDOR") {
    andConditions.push({ vendorId: userData?.vendorId as string });
  }
  if (userData.role === "CUSTOMER") {
    andConditions.push({ userId: userData?.userId as string });
  }

  // Build query using the queryBuilder
  const quary = queryBuilder({
    searchableFields: [],
    filters, // status, paymentStatus, vendorId (for ADMIN)
    pagination: options,
    additionalConditions: andConditions,
  });

  // Fetch orders based on role and query
  const result = await prisma.order.findMany({
    where: quary.where,
    orderBy: quary.orderBy,
    skip: quary.skip,
    take: quary.limit,
    include:
      userData.role === "ADMIN"
        ? { User: { select: { Profile: true } }, Vendor: true, OrderItem: true }
        : userData.role === "VENDOR"
        ? { User: { select: { Profile: true } }, OrderItem: true }
        : { Vendor: true, OrderItem: true },
  });

  // Count total orders based on query conditions
  const total = await prisma.order.count({ where: quary.where });

  // Return metadata with result
  return returnMetaData(total, quary, result);
};

export const OrderService = {
  createOrder,
  changeOrderStatus,
  getAllOrders,
};
