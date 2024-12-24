// used in ZOD Middleware validation

import catchAsync from "../utils/catchAsync";
import { AnyZodObject } from "zod";

const validateRequest = (schema: AnyZodObject, skipValidation = false) => {
  return catchAsync(async (req, res, next) => {
    if (skipValidation && req?.file) {
      return next();
    }
    const data = {
      body: req?.body,
    };
    console.log(data, "asndijasbdjibasdji");
    const parsedData = await schema.parseAsync(data);
    req.body = parsedData?.body;
    next();
  });
};

// This validation middleware is only call the access-token retrival time when we pass the refresh token in cookies
export const validateRequestCookies = (schema: AnyZodObject) => {
  return catchAsync(async (req, res, next) => {
    const parsedCookies = await schema.parseAsync({
      cookies: req.cookies,
    });

    req.cookies = parsedCookies.cookies;

    next();
  });
};

export default validateRequest;
