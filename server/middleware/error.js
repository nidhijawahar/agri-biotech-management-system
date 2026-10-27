const { httpError } = require('../utils/helpers');
exports.notFound = (req, res, next) => next(httpError(404, `Route not found: ${req.originalUrl}`));
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500, msg = err.message;
  if (err.name === 'ValidationError') { status = 400; msg = Object.values(err.errors).map((e) => e.message).join(', '); }
  else if (err.name === 'CastError') { status = 400; msg = `Invalid ${err.path}`; }
  else if (err.code === 11000) { status = 400; msg = 'Already exists: ' + Object.keys(err.keyValue || {}).join(', '); }
  else if (err.name === 'MulterError') { status = 400; msg = err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5MB or smaller' : err.message; }
  if (status === 500) { console.error(err); msg = 'Server error'; }
  res.status(status).json({ message: msg });
};
