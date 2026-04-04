export const getPagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getSort = (query = {}, defaultSort = "-createdAt") => {
  if (!query.sortBy) return defaultSort;
  const order = query.sortOrder === "asc" ? "" : "-";
  return `${order}${query.sortBy}`;
};

export const buildMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit) || 1,
  };
};
