import { z } from "zod";

const update = z.object({
  body: z
    .object({
      phone: z.string().optional(),
      name: z.string().optional(),
      address: z.string().optional(),
      description: z.string().optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { message: "At least one field must be provided." }
    ),
});

export const UserValidation = { update };
