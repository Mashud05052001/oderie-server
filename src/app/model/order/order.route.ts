import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { OrderController } from "./order.s.controller";
import auth from "../../middleware/auth";
import { OrderValidation } from "./order.validation";

const router = Router();

router.post(
  "/",
  validateRequest(OrderValidation.create),
  auth("CUSTOMER"),
  OrderController.createOrder
);

// User => can change to CANCELED
// Vendor => can change to DELEVERED
router.patch(
  "/:id",
  auth("VENDOR", "CUSTOMER"),
  OrderController.changeOrderStatus
);

router.get(
  "/",
  auth("ADMIN", "CUSTOMER", "VENDOR"),
  OrderController.getAllOrders
);

export const OrderRoutes = router;
