import { Router } from "express";
import validateRequest, {
  validateRequestCookies,
} from "../../middleware/validateRequest";
import { AuthController } from "./auth.s.controller";
import { AuthValidation } from "./auth.validation";
import auth from "../../middleware/auth";
import { prisma } from "../../config";
import { Prisma } from "@prisma/client";
import { multerUpload } from "../../config/multer.config";
import validateImageFileRequest from "../../middleware/validateImageFileRequest";
import { ImageFileValidationSchema } from "../../zod/image.validation";
import { parseBody } from "../../middleware/bodyParser";

const router = Router();

router.get("/all", async (req, res) => {
  const isUserExist = await prisma.user.findMany();
  console.log(isUserExist);
});

router.post(
  "/register",
  multerUpload.single("file"),
  validateImageFileRequest(ImageFileValidationSchema, true),
  parseBody,
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.registerUser
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser
);

router.post(
  "/change-password",
  validateRequest(AuthValidation.changePasswordValidationSchema),
  auth("ADMIN", "CUSTOMER", "VENDOR"),
  AuthController.changePassword
);

router.post(
  "/refresh-token",
  validateRequestCookies(AuthValidation.accessTokenValidationSchema),
  AuthController.accessToken
);

router.post(
  "/forget-password",
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthController.forgetPassword
);

router.post(
  "/check-reset-code",
  validateRequest(AuthValidation.checkResetCodeValidationSchema),
  AuthController.checkResetCode
);

router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword
);

router.post(
  "/send-contact-email",
  validateRequest(AuthValidation.sendEmailValidationSchem),
  AuthController.sendContactEmail
);

export const AuthRoutes = router;
