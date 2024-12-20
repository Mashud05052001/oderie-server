import { Prisma } from "@prisma/client";

export const allProductIncludes: (keyof Prisma.ProductInclude)[] = [
  "Category",
  // "ProductCoupon",
  "Order",
  "Review",
  "Vendor",
  "_count",
];

export const allUserIncludes: (keyof Prisma.UserInclude)[] = [
  "Follow",
  "Order",
  "Profile",
  "Review",
  "Vendor",
  "_count",
];

export const paginateProps = ["page", "limit", "sortBy", "sortOrder"];
