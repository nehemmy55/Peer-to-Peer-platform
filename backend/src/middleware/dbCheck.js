import mongoose from 'mongoose';

export function checkDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database not connected',
      message: 'Please wait for database connection'
    });
  }
  next();
}
