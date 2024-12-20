export type TProductCreate = {
  categoryId: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  discount: number;
};
export type TProductUpdate = {
  categoryId?: string;
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
  img?: string[];
};

export type TProductFilterItems = {
  searchTerm?: string | undefined;
  vendorId: string | undefined;
  categoryId: string | undefined;
  price: string | undefined;
  isDeleted: "true" | "false" | undefined;
};
