import { z } from "zod";

export const create = z.object({
  body: z.object({
    name: z.string({
      invalid_type_error: "Category name must be string",
      required_error: "Category name must required",
    }),
  }),
});

export const CategoryValidation = {
  create,
};
