const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  crop: { type: String, required: [true, 'Crop is required'], trim: true, index: true },
  cropVariety: String, problem: String,
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  method: { type: String, required: true, enum: ['Biofertilizer', 'Biopesticide', 'Microbial Solution', 'Disease-Resistant Variety', 'Tissue Culture', 'Biological Crop Protection', 'Soil Microbial Management', 'Other'], index: true },
  requiredInputs: String, applicationMethod: String, expectedBenefits: String, precautions: String, growthStage: String,
  expertName: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('BiotechnologyRecommendation', schema);
