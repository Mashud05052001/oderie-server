import { Router } from "express";
import { FollowController } from "./follow.s.controller";
import auth from "../../middleware/auth";

const router = Router();

// vendorID
router.post("/:id", auth("CUSTOMER"), FollowController.addOrRemoveFollow);

// vendorID
router.get("/:id", FollowController.getFollowWithoutToken);

router.get(
  "/",
  auth("ADMIN", "CUSTOMER", "VENDOR"),
  FollowController.getFollowUsingToken
);

export const FollowRoutes = router;
