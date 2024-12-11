import { TPaginationOptions } from "../interface/model.type";

type TPaginationReturns = {
  skip: number;
  page: number;
  limit: number;
  sortOrder: string;
  sortBy: string;
};

export const calculatePagination = (
  options: TPaginationOptions
): TPaginationReturns => {
  const page = Number(options?.page) || 1;
  const limit = Number(options?.limit) || 5;
  const skip = (page - 1) * limit;
  const sortBy = options?.sortBy || "createdAt";
  const sortOrder = options?.sortOrder || "desc";
  return { skip, page, limit, sortOrder, sortBy };
};
