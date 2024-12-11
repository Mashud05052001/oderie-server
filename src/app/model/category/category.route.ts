import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import { CategoryController } from "./category.s.controller";
import { multerUpload } from "../../config/multer.config";
import validateImageFileRequest from "../../middleware/validateImageFileRequest";
import { ImageFileValidationSchema } from "../../zod/image.validation";
import { parseBody } from "../../middleware/bodyParser";
import { CategoryValidation } from "./category.validation";

const router = Router();

router.post(
  "/",
  auth("ADMIN"),
  multerUpload.single("file"),
  validateImageFileRequest(ImageFileValidationSchema, true),
  parseBody,
  validateRequest(CategoryValidation.create),
  CategoryController.createCategory
);

router.get("/", CategoryController.getAllCategories);

router.patch(
  "/:id",
  auth("ADMIN"),
  multerUpload.single("file"),
  (req, res, next) => {
    if (req.file) {
      validateImageFileRequest(ImageFileValidationSchema, false);
      req.body = JSON.parse(req.body.data);
      validateRequest(CategoryValidation.create);
    } else {
      validateRequest(CategoryValidation.create);
    }
    next();
  },
  CategoryController.updateCategory
);

router.delete("/:id", auth("ADMIN"), CategoryController.deleteCategory);

router.delete("/", auth("ADMIN"), CategoryController.deleteAllCategories);

export const CategoryRoutes = router;
