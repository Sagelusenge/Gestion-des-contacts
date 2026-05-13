export function getPagination(query) {
  const page = Math.max(Number.parseInt(query.page || '1', 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit || '20', 10), 1), 5000);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function toPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}
