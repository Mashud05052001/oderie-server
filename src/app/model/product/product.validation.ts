import { z } from "zod";

const create = z.object({
  body: z.object({
    categoryId: z.string().uuid().nonempty("Category ID is required"),
    title: z.string().nonempty("Title is required"),
    description: z.string().nonempty("Description is required"),
    price: z.number().positive("Price must be a positive number"),
    discount: z
      .number()
      .positive("Discount must be a positive number")
      .max(100, "Discount must be less then 100"),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .nonnegative("Quantity cannot be negative"),
  }),
});
const update = z.object({
  body: z
    .object({
      categoryId: z.string().uuid().optional(),
      title: z.string().min(1, "Product title cannot be empty").optional(),
      description: z
        .string()
        .min(1, "Product description cannot be empty")
        .optional(),
      img: z.string().array().optional(),
      price: z.number().positive("Price must be a positive number").optional(),
      quantity: z
        .number()
        .int("Product quantity must be an integer")
        .nonnegative("Product quantity cann't be negative")
        .optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { message: "At least one field must be provided." }
    ),
});

export const ProductValidation = {
  create,
  update,
};
