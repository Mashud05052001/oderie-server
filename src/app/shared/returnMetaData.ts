export const returnMetaData = (
  total: number,
  query: { page: number; limit: number },
  data: any
) => ({
  meta: {
    total,
    page: query.page,
    limit: query.limit,
  },
  data,
});
