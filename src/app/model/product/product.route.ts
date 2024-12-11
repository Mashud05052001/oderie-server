import { Router } from "express";
// Pleast put first alphabet smallercase carefully
// import { ProductValidation } from "./Product.validation";
import validateRequest from "../../middleware/validateRequest";
import { ProductController } from "./product.s.controller";
import { ProductValidation } from "./product.validation";
import { multerUpload } from "../../config/multer.config";
import validateImageFileRequest from "../../middleware/validateImageFileRequest";
import { ImageFilesOfArrayValidationSchema } from "../../zod/image.validation";
import { parseBody } from "../../middleware/bodyParser";
import auth from "../../middleware/auth";
import authDecodeToken from "../../middleware/authDecodeToken";

const router = Router();

router.post(
  "/",
  auth("VENDOR"),
  multerUpload.fields([{ name: "files", maxCount: 4 }]),
  validateImageFileRequest(ImageFilesOfArrayValidationSchema, false),
  parseBody,
  validateRequest(ProductValidation.create),
  ProductController.createProduct
);

router.post(
  "/duplicate/:id",
  auth("VENDOR"),
  ProductController.duplicateProduct
);

router.get("/", authDecodeToken(), ProductController.getAllProducts);
router.get("/:id", ProductController.getSingleProduct);

router.patch(
  "/:id",
  auth("VENDOR"),
  multerUpload.fields([{ name: "files", maxCount: 4 }]),
  (req, res, next) => {
    if (req.files) {
      validateImageFileRequest(ImageFilesOfArrayValidationSchema, false);
      req.body = JSON.parse(req.body.data);
      validateRequest(ProductValidation.update);
    } else {
      validateRequest(ProductValidation.update);
    }
    next();
  },
  ProductController.updateProduct
);
router.delete("/:id", auth("ADMIN", "VENDOR"), ProductController.deleteProduct);

export const ProductRoutes = router;
