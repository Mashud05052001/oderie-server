import { OrderStatus } from "@prisma/client";
import { z } from "zod";

// Define the OrderStatus enum for validation
const orderStatus = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"];

// Define the Zod schema for the TCreateOrder type
const create = z.object({
  body: z.object({
    vendorId: z.string().uuid(),
    status: z
      .enum(orderStatus as [string, ...string[]])
      .optional()
      .default("PENDING"),
    totalPrice: z.number().positive(),
    products: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().positive(),
        })
      )
      .min(1),

    cancleUrl: z.string(),
  }),
});

const changeStatus = z.object({
  body: z.object({
    status: z.enum(["DELIVERED", "CANCELLED"] as [string, ...string[]], {
      message: "Order status must be either DELEVERED or CANCELLED",
      required_error: "Order status is required",
    }),
  }),
});

export const OrderValidation = {
  create,
  changeStatus,
};
