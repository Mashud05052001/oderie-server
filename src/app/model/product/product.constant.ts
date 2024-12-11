import { TProductFilterItems } from "./product.interface";

export const productSearchableFields: string[] = ["title", "description"];

export const productFilterableFields: (keyof TProductFilterItems)[] = [
  "searchTerm",
  "vendorId",
  "categoryId",
  "price",
  "isDeleted",
];
