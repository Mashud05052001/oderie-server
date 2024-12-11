/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import config from "../config";
import { TErrorSources } from "../interface/error";
import {
  deleteMultipleImagesFromCloudinary,
  deleteSingleImageFromCloudinary,
} from "../utils/deleteImage";
import { TImageFile, TImageFiles } from "../interface/image.interface";

const globalErrorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  let statusCode = err?.status || 500,
    message = err?.message || `Something went wrong!`,
    errorSources: TErrorSources = [
      {
        path: "",
        message: `Something went wrong!`,
      },
    ];

  if (req.files && Object.keys(req.files).length > 0) {
    await deleteMultipleImagesFromCloudinary(req.files as TImageFiles);
  }
  if (req.file && Object.keys(req.file).length > 0) {
    await deleteSingleImageFromCloudinary(req.file as TImageFile);
  }

  // const getModifiedError = () => {
  //   if (err instanceof ZodError) return handleZodError(err);
  //   else if (err?.name === 'ValidationError') return handleValidationError(err);
  //   else if (err?.name === 'CastError') return handleCastError(err);
  //   else if (err.code === 11000) return handleDuplicateError(err);
  //   else if (err.name === 'MulterError') return handleMulterError(err);
  //   return null;
  // };
  // const modifiedError = getModifiedError();

  // if (modifiedError) {
  //   statusCode = modifiedError.statusCode;
  //   message = modifiedError.message;
  //   errorSources = modifiedError.errorSources;
  // } else if (err instanceof AppError) {
  //   statusCode = err?.statusCode;
  //   message = err?.message;
  //   errorSources = [{ path: '', message: err?.message }];
  // } else if (err instanceof Error) {
  //   message = err?.message;
  //   errorSources = [{ path: '', message: err?.message }];
  // }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    originalError: err,
    stack: config.node_env === "development" ? err?.stack : null,
  });
};

export default globalErrorHandler;
