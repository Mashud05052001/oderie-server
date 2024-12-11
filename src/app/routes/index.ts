import { Router } from "express";
import { AuthRoutes } from "../model/auth/auth.route";
import { CategoryRoutes } from "../model/category/category.route";
import { ProductRoutes } from "../model/product/product.route";
import { FollowRoutes } from "../model/follow/follow.route";
import { UserRoutes } from "../model/users/user.route";
import { CouponRoutes } from "../model/coupon/coupon.route";
import { OrderRoutes } from "../model/order/order.route";
import { PaymentRoutes } from "../model/payment/payment.route";
import { ReviewRoutes } from "../model/review/review.route";
import { VendorResponseRoutes } from "../model/vendorResponse/vendorResponse.route";

const router = Router();

const moduleRoutes = [
  { path: "/auth", element: AuthRoutes },
  { path: "/category", element: CategoryRoutes },
  { path: "/product", element: ProductRoutes },
  { path: "/follow", element: FollowRoutes },
  { path: "/user", element: UserRoutes },
  { path: "/coupon", element: CouponRoutes },
  { path: "/order", element: OrderRoutes },
  { path: "/payment", element: PaymentRoutes },
  { path: "/review", element: ReviewRoutes },
  { path: "/vendor-response", element: VendorResponseRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.element));

export const AllRoutes = router;
