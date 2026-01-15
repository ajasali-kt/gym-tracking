/**
 * Global error handling middleware
 * Must be defined last in the middleware chain
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Prisma-specific errors
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: true,
    message: message,
    statusCode: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (err, res) => {
  const errorMap = {
    // Unique constraint violation
    'P2002': {
      statusCode: 400,
      message: `A record with this ${err.meta?.target?.[0] || 'field'} already exists`
    },
    // Record not found
    'P2025': {
      statusCode: 404,
      message: 'Record not found'
    },
    // Foreign key constraint failed
    'P2003': {
      statusCode: 400,
      message: 'Invalid reference - related record does not exist'
    },
    // Required field missing
    'P2011': {
      statusCode: 400,
      message: 'Required field is missing'
    },
    // Record to delete does not exist
    'P2018': {
      statusCode: 404,
      message: 'The record to delete does not exist'
    }
  };

  const error = errorMap[err.code] || {
    statusCode: 500,
    message: 'Database error occurred'
  };

  res.status(error.statusCode).json({
    error: true,
    message: error.message,
    statusCode: error.statusCode,
    ...(process.env.NODE_ENV === 'development' && {
      prismaCode: err.code,
      details: err.meta
    })
  });
};

module.exports = errorHandler;
