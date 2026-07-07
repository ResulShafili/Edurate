function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const isUploadError =
    error.name === 'MulterError' ||
    error.message === 'Only PDF, PNG, JPG, and WEBP files are allowed';
  const statusCode = error.statusCode || (isUploadError ? 400 : 500);

  res.status(statusCode).json({
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}

module.exports = {
  errorHandler,
  notFound
};
