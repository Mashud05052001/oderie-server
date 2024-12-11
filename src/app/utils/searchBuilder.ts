import { Prisma } from "@prisma/client";
import { TPaginationOptions } from "../interface/model.type";
import { calculatePagination } from "../shared/calculatePaginate";
import { calculateRange } from "../shared/calculateRange";

type TQueryBuilderParams<TWhereInput> = {
  filters?: Record<string, any>;
  searchableFields?: string[];
  additionalConditions?: TWhereInput[];
  pagination: TPaginationOptions;
};

type TReturnBuilderParams<TWhereInput> = {
  where: TWhereInput;
  orderBy: Record<string, string>;
  limit: number;
  page: number;
  skip: number;
};

export const queryBuilder = <TWhereInput>({
  filters = {},
  searchableFields = [],
  additionalConditions = [],
  pagination,
}: TQueryBuilderParams<TWhereInput>): TReturnBuilderParams<TWhereInput> => {
  const { searchTerm, ...filterData } = filters;
  const { limit, page, skip, sortBy, sortOrder } =
    calculatePagination(pagination);

  // Initialize the conditions array with any additional conditions
  const andConditions: TWhereInput[] = [...additionalConditions];

  // Handle the search term
  if (searchTerm) {
    andConditions.push({
      OR: searchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    } as TWhereInput);
  }

  // Handle specific filter conditions
  if (Object.keys(filterData).length > 0) {
    let modifiedFilterData = filterData;
    if (filterData?.price) {
      const { price, ...othersFilterData } = filterData;
      modifiedFilterData = othersFilterData;
    }
    if (filterData?.isDeleted) {
      const { isDeleted, ...others } = filterData;
      modifiedFilterData = others;
    }
    const filterConditions = Object.keys(modifiedFilterData).map((key) => ({
      [key]: {
        equals: filterData[key],
      },
    }));
    andConditions.push({ AND: filterConditions } as TWhereInput);
  }

  console.log("Inside Query Builder");
  console.dir(andConditions, { depth: "Infinite" });
  return {
    where: (andConditions.length > 0
      ? { AND: andConditions }
      : {}) as TWhereInput,
    orderBy: { [sortBy]: sortOrder },
    skip,
    limit,
    page,
  };
};
