import { Router } from "express";
import { FollowController } from "./follow.s.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/:id", auth("CUSTOMER"), FollowController.addOrRemoveFollow);

router.get("/:id", FollowController.getFollowWithoutToken);

router.get(
  "/",
  auth("ADMIN", "CUSTOMER", "VENDOR"),
  FollowController.getFollowUsingToken
);

export const FollowRoutes = router;
