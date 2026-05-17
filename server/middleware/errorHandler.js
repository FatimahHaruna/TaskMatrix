const errorHandler = (err, req, res, next) => {
  // Detect MongoDB unavailable errors and return a clear message
  const msg = err.message || '';
  if (
    msg.includes('buffering timed out') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('failed to connect') ||
    msg.includes('MongoNetworkError') ||
    msg.includes('MongoServerSelectionError')
  ) {
    return res.status(503).json({
      message: 'Cannot reach the database. Make sure MongoDB is running and MONGO_URI in server/.env is correct.',
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: msg || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
