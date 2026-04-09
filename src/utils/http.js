export const sendSuccess = (res, statusCode, message, data = null) => {
  const payload = { success: true, message };

  if (data !== null) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

export const sendError = (res, statusCode, message, error = null) => {
  const payload = { success: false, message };

  if (error) {
    payload.error = error;
  }

  return res.status(statusCode).json(payload);
};

export const notFoundHandler = (req, res) => {
  return sendError(res, 404, 'Route not found.');
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);
  return sendError(res, 500, 'Internal server error.');
};
