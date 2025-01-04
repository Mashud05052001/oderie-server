import { Router } from "express";
import { CouponController } from "./coupon.s.controller";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { CouponValidation } from "./coupon.validation";

const router = Router();

// Get single product all coupons.

router.get("/vendor/:id", auth("ADMIN"), CouponController.getAllCouponOfVendor);

router.get("/vendor", auth("VENDOR"), CouponController.getAllCouponOfVendor);

router.get("/:id", CouponController.getSingleProductAllCoupons);

router.post(
  "/",
  auth("VENDOR"),
  validateRequest(CouponValidation.create),
  CouponController.createCoupon
);

router.patch(
  "/product",
  validateRequest(CouponValidation.deleteCouponProduct),
  auth("ADMIN", "VENDOR"),
  CouponController.deleteCouponProduct
);

router.patch(
  "/:id",
  auth("VENDOR"),
  validateRequest(CouponValidation.update),
  CouponController.updateCoupon
);

router.delete("/:id", auth("ADMIN", "VENDOR"), CouponController.deleteCoupon);

export const CouponRoutes = router;
