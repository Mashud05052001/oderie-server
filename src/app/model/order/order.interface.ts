import { OrderStatus } from "@prisma/client";

export type TCreateOrder = {
  userId: string;
  vendorId: string;
  status?: OrderStatus;
  totalPrice: number;
  products: {
    productId: string;
    quantity: number;
  }[];

  cancleUrl: string;
};

export type TInvalidProduct = {
  id: string;
  title: string;
  requestedQuantity: number;
  availableQuantity: number;
};
