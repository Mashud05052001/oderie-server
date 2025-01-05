import { NextFunction, Request, Response, Router } from "express";
import auth from "../../middleware/auth";
import { ReviewController } from "./review.s.controller";
import validateRequest from "../../middleware/validateRequest";
import { multerUpload } from "../../config/multer.config";
import validateImageFileRequest from "../../middleware/validateImageFileRequest";
import { ImageFileValidationSchema } from "../../zod/image.validation";
import { ReviewValidation } from "./review.validation";

const router = Router();

// Customer & Vendor can get it's all product reviews
router.get("/", auth("CUSTOMER", "VENDOR"), ReviewController.getMyAllReviews);
router.get(
  "/products",
  auth("VENDOR"),
  ReviewController.getReviewedProductInfo
);

// productId
router.get("/:id", ReviewController.getSingleProductReview);

router.post(
  "/",
  auth("CUSTOMER"),
  multerUpload.single("file"),
  (req, res, next) => {
    if (req.file) {
      validateImageFileRequest(ImageFileValidationSchema, false);
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(ReviewValidation.create, true),
  ReviewController.createReview
);

// reviewId
router.patch(
  "/:id",
  auth("CUSTOMER"),
  validateRequest(ReviewValidation.update),
  ReviewController.updateReview
);

// reviewId
router.delete("/:id", auth("CUSTOMER"), ReviewController.deleteReview);

export const ReviewRoutes = router;
