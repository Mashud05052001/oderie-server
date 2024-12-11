import { OrderStatus } from "@prisma/client";
import { z } from "zod";

// Define the OrderStatus enum for validation
const orderStatus = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"];

// Define the Zod schema for the TCreateOrder type
const create = z.object({
  body: z.object({
    userId: z.string().uuid(),
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

export const OrderValidation = {
  create,
};
