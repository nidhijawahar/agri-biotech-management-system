const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  crop: { type: String, required: [true, 'Crop is required'], trim: true, index: true },
  cropVariety: String,
  location: { type: String, required: [true, 'Location is required'], trim: true },
  category: { type: String, required: true, enum: ['Pest', 'Disease', 'Nutrient Deficiency', 'Water Stress', 'Soil Issue', 'Weather Damage', 'Other'], index: true },
  description: { type: String, required: [true, 'Description is required'] },
  symptoms: String,
  images: [String],
  dateObserved: { type: Date, default: Date.now },
  status: { type: String, enum: ['Open', 'Under Review', 'Advisory Issued', 'Closed'], default: 'Open', index: true },
}, { timestamps: true });
module.exports = mongoose.model('FarmerProblem', schema);
