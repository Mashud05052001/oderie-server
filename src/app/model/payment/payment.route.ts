import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { PaymentHandle } from "./payment.service";
import { PaymentValidation } from "./payment.validation";
import auth from "../../middleware/auth";

const router = Router();

router.post("/success", PaymentHandle.confirmationPayment);
router.post("/failed", PaymentHandle.confirmationPayment);

router.get(
  "/",
  auth("ADMIN", "CUSTOMER", "VENDOR"),
  PaymentHandle.getAllPayments
);

export const PaymentRoutes = router;
