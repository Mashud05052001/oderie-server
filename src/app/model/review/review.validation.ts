import { z } from "zod";

const create = z.object({
  body: z.object({
    orderId: z.string(),
    message: z.string(),
    ratings: z.number().min(1).max(5),
    productId: z.string(),
  }),
});

const update = z.object({
  body: z
    .object({
      message: z.string().optional(),
      // ratings: z.enum(["1", "2", "3", "4", "5"]).transform(Number).optional(),
      ratings: z.number().min(1).max(5).optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { message: "At least one field must be provided." }
    ),
});

export const ReviewValidation = {
  create,
  update,
};
