export interface QueryOptions {
  model: any;
  query: any;
  searchableFields?: string[];
  forcedFilters?: Record<string, any>;
  includes?: Record<string, any>;
  role?: string;
  relationFilters?: any[];
}
// minor change
export const dynamicQueryBuilder = async ({
  model,
  query,
  searchableFields = [],
  forcedFilters = {},
  includes = {},
  relationFilters = [],
}: QueryOptions) => {
  const {
    page = 1,
    limit,
    search,
    sortBy = "createdAt",
    order = "desc",
    ...filters
  } = query;

  const numericLimit = limit ? parseInt(limit as string, 10) : undefined;
  const numericPage = parseInt(page as string, 10);
  const skip = numericLimit ? (numericPage - 1) * numericLimit : 0;

  const searchCondition =
    search && searchableFields.length > 0
      ? {
          OR: searchableFields.map((field) => {
            const keys = field.includes(".") ? field.split(".") : [field];
            const value = { contains: search, mode: "insensitive" };
            // @ts-ignore
            return keys.reduceRight((acc, key) => ({ [key]: acc }), value);
          }),
        }
      : {};

  const filterConditions = {
    ...filters,
    ...forcedFilters,
  };

  const where = {
    ...searchCondition,
    ...filterConditions,
    ...(relationFilters.length > 0 ? { AND: relationFilters } : {}),
  };

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: numericLimit,
      orderBy: { [sortBy]: order },
      include: includes || {},
    }),
    model.count({ where }),
  ]);

  const totalPages = numericLimit ? Math.ceil(total / numericLimit) : 1;

  return {
    meta: {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      perPage: numericLimit ?? total,
    },
    data,
  };
};
