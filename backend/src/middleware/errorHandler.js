const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';
  
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: message,
      ...(process.env.NODE_ENV === 'development' && { details: err.stack })
    }
  });
};

module.exports = errorHandler;
