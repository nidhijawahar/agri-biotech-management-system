const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  cropName: { type: String, required: [true, 'Crop name is required'], trim: true, index: true },
  varietyName: { type: String, required: [true, 'Variety name is required'], trim: true },
  category: { type: String, required: true, enum: ['Cereal', 'Pulse', 'Oilseed', 'Vegetable', 'Fruit', 'Cash Crop', 'Other'], index: true },
  scientificName: String,
  season: { type: String, required: true, enum: ['Kharif', 'Rabi', 'Zaid', 'Perennial', 'Year-round'], index: true },
  soilType: String, waterRequirement: String, temperatureRange: String, expectedYield: String, diseaseResistance: String, description: String,
  recommendedRegions: [String],
  images: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
schema.index({ cropName: 1, varietyName: 1 }, { unique: true });
module.exports = mongoose.model('Crop', schema);
