import axios from "axios";
import config, { prisma } from "../../config";
import AppError from "../../errors/AppError";
import { TExtendedUserData } from "../../interface/jwt.type";
import { TInitiatePayment, TPaymentResponse } from "./payment.interface";
import moment from "moment";
import httpStatus from "http-status";

export const verifyPayment = async (transactionId: string) => {
  try {
    const response: { data: TPaymentResponse } = await axios.get(
      config.aamarpay_verify_url!,
      {
        params: {
          request_id: transactionId,
          store_id: config.aamarpay_store_id,
          signature_key: config.aamarpay_signature_id,
          type: "json",
        },
      }
    );
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new AppError(500, "Payment validation failed");
  }
};

export const initiatePayment = async (
  payload: TInitiatePayment,
  userInfo: TExtendedUserData,
  totalAmount: number
) => {
  const userProfileInfo = await prisma.profile.findUnique({
    where: { email: userInfo?.email },
  });
  let { cancleUrl, orderId } = payload;
  const customerName = userProfileInfo?.name as string,
    customerEmail = userInfo?.email,
    userId = userInfo?.userId,
    customerPhone = userProfileInfo?.phone as string;

  const storeId = config.aamarpay_store_id;
  const signatureKey = config.aamarpay_signature_id;
  const url = config.aamarpay_url;

  const userName = customerName.includes(" ")
    ? customerName.split(" ")[0]
    : customerName;
  const timestamp = Date.now();
  const randomValue = Math.random().toString(36).substring(2, 8);
  const transactionId = `T-${userName}${randomValue}:${timestamp}`.trim();
  const successUrl = `${config.backend_api}/payment/success?transactionId=${transactionId}&orderId=${orderId}&userId=${userId}`;
  const failedUrl = `${config.backend_api}/payment/failed?transactionId=${transactionId}&orderId=${orderId}`;
  // const cancel_url = `${cancleUrl}&paymentId=${paymentId}`;
  const cancel_url = cancleUrl;
  const paymentData = {
    store_id: storeId,
    signature_key: signatureKey,
    tran_id: transactionId,
    amount: Number(totalAmount),
    currency: "BDT",
    cus_name: customerName,
    cus_email: customerEmail,
    cus_phone: customerPhone,
    success_url: successUrl,
    fail_url: failedUrl,
    cancel_url: cancel_url,
    type: "json",
    desc: `Payment Date : ${moment(new Date()).format("DD-MM-YYYY LT")}`,
  };

  try {
    const response = await axios.post(url as string, paymentData);
    return { data: response?.data?.payment_url, transactionId };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Payment failed!");
  }
};
