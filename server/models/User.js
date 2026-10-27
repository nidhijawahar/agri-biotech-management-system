const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const schema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email address'] },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'], select: false },
  role: { type: String, enum: ['admin', 'expert', 'farmer'], default: 'farmer' },
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
}, { timestamps: true, toJSON: { transform: (doc, r) => { delete r.password; delete r.__v; return r; } } });
schema.index({ name: 'text', email: 'text' });
schema.pre('save', async function (next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
  next();
});
schema.methods.matchPassword = function (p) { return bcrypt.compare(p, this.password); };
module.exports = mongoose.model('User', schema);
