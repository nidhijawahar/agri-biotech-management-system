const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  farmerName: { type: String, required: [true, 'Farmer name is required'], trim: true },
  location: { type: String, required: [true, 'Location is required'], trim: true, index: true },
  crop: { type: String, required: [true, 'Crop is required'], trim: true, index: true },
  cropVariety: String,
  growthStage: { type: String, enum: ['Germination', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvest'], default: 'Vegetative' },
  soilCondition: String, weatherCondition: String, pestDiseaseSymptoms: String,
  plantHealth: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'], required: true },
  notes: String,
  images: [String],
  observationDate: { type: Date, default: Date.now, index: true },
  gps: String,
  observedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
}, { timestamps: true });
module.exports = mongoose.model('FieldObservation', schema);
