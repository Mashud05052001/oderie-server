import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export type TPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

export type TInclude =
  | Record<keyof Prisma.ProductInclude<DefaultArgs>, boolean>
  | undefined;
