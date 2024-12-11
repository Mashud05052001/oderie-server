export type TUserUpdate = {
  // Profile & Vendor
  phone?: string;
  name?: string;
  address?: string;
  // Vendor
  description?: string;
};

export type TUserFilterItems = {
  searchTerm?: string | undefined;
  phone: string | undefined;
  address: string | undefined;
  isDeleted: string | undefined;
};
