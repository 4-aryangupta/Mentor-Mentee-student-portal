export const notFound = (req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
export const errorMiddleware = (err, req, res, next) => {
  if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  if (err.name === 'SequelizeForeignKeyConstraintError') return res.status(400).json({ success: false, message: 'This record is linked to other records and cannot be removed.' });
  const status = err.statusCode || err.status || 500;
  const message = status >= 500 && process.env.NODE_ENV === 'production' ? 'Something went wrong. Please try again.' : err.message || 'Internal server error.';
  if (process.env.NODE_ENV !== 'production' && status >= 500) console.error(err);
  res.status(status).json({ success: false, message });
};
