import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodArray, ZodEffects, ZodRecord } from "zod";
import catchAsync from "../utils/catchAsync";

const validateImageFileRequest = (
  schema: AnyZodObject | ZodEffects<any> | ZodArray<any> | ZodRecord<any>,
  isSingleImageFile: boolean
) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (isSingleImageFile) {
      console.log("single file validating");
      const parsedFile = await schema.parseAsync({
        file: req.file,
      });
      req.file = parsedFile.file;
    } else {
      console.log("multiple file validating");
      const parsedFile = await schema.parseAsync({
        files: req.files,
      });
      req.files = parsedFile.files;
    }

    next();
  });
};

export default validateImageFileRequest;
