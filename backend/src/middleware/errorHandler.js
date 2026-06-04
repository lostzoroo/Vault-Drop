import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error]: ${err.message}`);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: config.env === 'development' ? err.stack : undefined,
  });
};