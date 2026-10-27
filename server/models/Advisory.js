const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Farmer is required'], index: true },
  expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmerProblem' },
  crop: { type: String, required: [true, 'Crop is required'], trim: true, index: true },
  cropVariety: String, field: String,
  problemIdentified: { type: String, required: [true, 'Problem identified is required'] },
  recommendedAction: { type: String, required: [true, 'Recommended action is required'] },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium', index: true },
  message: { type: String, required: [true, 'Advisory message is required'] },
  followUpDate: Date,
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending', index: true },
}, { timestamps: true });
module.exports = mongoose.model('Advisory', schema);
