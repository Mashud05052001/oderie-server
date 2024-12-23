import { Router } from "express";
import { UserController } from "./user.s.controller";
import auth from "../../middleware/auth";
import { multerUpload } from "../../config/multer.config";
import validateRequest from "../../middleware/validateRequest";
import validateImageFileRequest from "../../middleware/validateImageFileRequest";
import { ImageFileValidationSchema } from "../../zod/image.validation";
import { UserValidation } from "./user.validation";
const router = Router();

router.patch(
  "/update",
  auth("ADMIN", "CUSTOMER", "VENDOR"),
  multerUpload.single("file"),
  (req, res, next) => {
    if (req.file) {
      validateImageFileRequest(ImageFileValidationSchema, true);
      req.body = JSON.parse(req.body?.data);
    }
    next();
  },
  validateRequest(UserValidation.update, true),
  UserController.update
);

// ADMIN ONLY
router.patch("/blacklist/:id", auth("ADMIN"), UserController.blacklistVendor);

router.get("/", auth("ADMIN"), UserController.getUser);
router.get("/vendor/:id", UserController.getVendor);

router.get("/me", auth("ADMIN", "CUSTOMER", "VENDOR"), UserController.getMe);

export const UserRoutes = router;
