import { RequestHandler } from "express";
import httpStatus from "http-status";

const notFound: RequestHandler = async (req, res) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API route not found",
  });
};

export default notFound;
