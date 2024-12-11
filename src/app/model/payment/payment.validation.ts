import { z } from "zod";

const create = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    cancleUrl: z.string(),
  }),
});

export const PaymentValidation = {
  create,
};
