export const sendResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...(data && { data }),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const sendPaginatedResponse = (res, statusCode, message, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    pagination: {
      currentPage: page,
      limit,
      total,
      totalPages,
    },
  };
  return res.status(statusCode).json(response);
};
