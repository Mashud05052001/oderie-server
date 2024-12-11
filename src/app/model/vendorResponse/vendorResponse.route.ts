import { NextFunction, Request, Response, Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { VendorResponseController } from "./vendorResponse.s.controller";
import { VendorResponseValidationSchema } from "./vendorResponse.validation";

const router = Router();

// Route to create a new vendor response
router.post(
  "/",
  auth("VENDOR"),
  validateRequest(VendorResponseValidationSchema.create),
  VendorResponseController.create
);

// Route to update an existing vendor response by ID
router.patch(
  "/:id",
  auth("VENDOR"),
  validateRequest(VendorResponseValidationSchema.update),
  VendorResponseController.update
);

// Route to delete a vendor response by ID
router.delete(
  "/:id",
  auth("VENDOR", "ADMIN"),
  VendorResponseController.deleteVendorResponse
);

export const VendorResponseRoutes = router;
