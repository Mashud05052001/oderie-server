import { verifyPayment } from "./payment.utils";

import fs from "fs";
import path from "path";
import { prisma } from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import pick from "../../utils/pick";
import { paginateProps } from "../../constant/model.constant";
import { queryBuilder } from "../../utils/searchBuilder";
import { returnMetaData } from "../../shared/returnMetaData";

// const createPayment = catchAsync(async (req, res) => {
//   const payload = req.body as TInitiatePayment;
//   const userInfo = req.extendedUserData;

//   console.log("object");

//   const orderData = await prisma.order.findUnique({
//     where: { id: payload.orderId, status: "PENDING" },
//   });

//   if (!orderData) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       `Something went wrong! please try again`
//     );
//   }
//   const result = await initiatePayment(payload, userInfo, orderData.totalPrice);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Initiate payment successfully",
//     data: result,
//   });
// });

const confirmationPayment = catchAsync(async (req, res) => {
  const transactionId = req?.query?.transactionId as string;
  console.log(transactionId);
  const orderId = req.query?.orderId as string;
  const orderInfo = await prisma.order.findUnique({
    where: { id: orderId, paymentStatus: "UNPAID" },
  });
  const paymentVerification = await verifyPayment(transactionId);

  let message = "",
    description = "",
    className = "",
    icon = "";
  console.log(__dirname);
  const confirmationHtmlFilePath = path.join(
    __dirname,
    "../../../../public/payment.html"
  );
  let templete = fs.readFileSync(confirmationHtmlFilePath, "utf-8");

  if (orderInfo && paymentVerification.pay_status === "Successful") {
    const paymentData = {
      amount: orderInfo.totalPrice,
      gatewayData: paymentVerification,
      orderId,
      transactionId,
    };
    try {
      await prisma.$transaction(async (tsx) => {
        await tsx.payment.create({ data: paymentData });
        await tsx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
          },
        });
        message = "Successfully Paid";
        className = "successfull";
        description = `Thank you for your payment.<br>Your transaction has been completed successfully.<br>TransactionId: ${transactionId}`;
        icon = "&#10003;";
      });
    } catch (error) {
      message = "Failed";
      className = "failed";
      description =
        "Unfortunately, your payment could not be processed. Please try again or contact support.";
      icon = "&#10060;";
    }
  } else {
    message = "Failed";
    className = "failed";
    description =
      "Unfortunately, your payment could not be processed. Please try again or contact support.";
    icon = "&#10060;";
  }

  templete = templete
    .replace("{{status}}", message)
    .replace("{{dynamicClass}}", className)
    .replace("{{description}}", description)
    .replace("{{icon}}", icon);

  res.send(templete);
});

const getAllPayments = catchAsync(async (req, res) => {
  const userInfo = req.extendedUserData;
  const userRole = userInfo.role;
  const options = pick(req.query, paginateProps);
  const filters = pick(req.query, ["searchTerm", "status", "paymentStatus"]);

  const andCondition: Prisma.OrderWhereInput[] = [];
  if (userRole === "CUSTOMER") andCondition.push({ userId: userInfo.userId });
  else if (userRole === "VENDOR")
    andCondition.push({ vendorId: userInfo?.vendorId as string });

  const query = queryBuilder({
    filters,
    pagination: options,
    additionalConditions: andCondition,
  });

  const result = await prisma.order.findMany({
    where: query.where,
    orderBy: query.orderBy,
    skip: query.skip,
    take: query.limit,
    include:
      userRole === "ADMIN"
        ? { User: { select: { Profile: true } }, Vendor: true, Payment: true }
        : userRole === "VENDOR"
        ? { User: { select: { Profile: true } }, Payment: true }
        : { Vendor: true, Payment: true },
  });
  const total = await prisma.order.count({ where: query.where });

  const final = returnMetaData(total, query, result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All payments retrived successfull",
    data: final,
  });
});

export const PaymentHandle = {
  confirmationPayment,
  getAllPayments,
};
