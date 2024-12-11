import { z } from "zod";

const create = z.object({
  body: z.object({
    message: z.string().min(1, { message: "Message is required" }),
    reviewId: z.string().uuid(),
  }),
});

const update = z.object({
  body: z.object({
    message: z.string().min(1, { message: "Message is required" }),
  }),
});

export const VendorResponseValidationSchema = { create, update };
