const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, httpError } = require('../utils/helpers');
exports.protect = asyncHandler(async (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) throw httpError(401, 'Not authenticated');
  let decoded;
  try { decoded = jwt.verify(h.slice(7), process.env.JWT_SECRET); } catch { throw httpError(401, 'Invalid or expired token'); }
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, 'User no longer exists');
  req.user = user;
  next();
});
exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(httpError(403, 'You do not have permission to perform this action'));
