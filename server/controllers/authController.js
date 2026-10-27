const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, httpError } = require('../utils/helpers');
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, location } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Name, email and password are required');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (await User.findOne({ email: String(email).toLowerCase() })) throw httpError(400, 'Email is already registered');
  // Admin accounts can never be self-registered
  const user = await User.create({ name, email, password, phone, location, role: role === 'expert' ? 'expert' : 'farmer' });
  res.status(201).json({ token: sign(user), user });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Invalid email or password');
  res.json({ token: sign(user), user });
});

exports.me = (req, res) => res.json(req.user);
