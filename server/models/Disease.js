const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  diseaseName: { type: String, required: [true, 'Disease name is required'], trim: true, index: true },
  crop: { type: String, required: [true, 'Crop affected is required'], trim: true, index: true },
  symptoms: { type: String, required: [true, 'Symptoms are required'] },
  causes: String, preventionMethods: String, treatment: String, environmentalConditions: String,
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium', index: true },
  status: { type: String, enum: ['Active', 'Under Control', 'Resolved'], default: 'Active', index: true },
  location: { type: String, trim: true, index: true },
  dateReported: { type: Date, default: Date.now },
  images: [String],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('Disease', schema);
