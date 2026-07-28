export const getPagination = (query) => {
  const page = parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
  const limit = parseInt(query.limit, 10) > 0 ? parseInt(query.limit, 10) : 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getPaginationData = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage,
    hasPrevPage,
  };
};
