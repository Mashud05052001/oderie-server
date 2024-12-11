import { z } from "zod";

const create = z.object({
  body: z.object({
    code: z
      .string()
      .min(4, "Coupon code should contain at least 4 characters")
      .optional(),
    percentage: z
      .number()
      .min(0, "Percentage should not less then 0")
      .max(100, "Percentage should not higher than 100"),
    // expiryDate: z.date(),
    expiryDate: z.string(),
    productIds: z.string().uuid().array(),
  }),
});

const update = z.object({
  body: z
    .object({
      code: z
        .string()
        .min(4, "Coupon code should contain at least 4 characters")
        .optional(),
      percentage: z
        .number()
        .min(0, "Percentage should not less then 0")
        .max(100, "Percentage should not higher than 100")
        .optional(),
      // expiryDate: z.date().optional(),
      expiryDate: z.string().optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { message: "At least one field must be provided." }
    ),
});

const deleteCouponProduct = z.object({
  body: z.object({
    couponId: z.string(),
    productId: z.string(),
  }),
});
export const CouponValidation = {
  create,
  update,
  deleteCouponProduct,
};
