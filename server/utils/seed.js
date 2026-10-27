const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User'), Crop = require('../models/Crop'), Disease = require('../models/Disease');
const Observation = require('../models/FieldObservation'), Rec = require('../models/BiotechnologyRecommendation');
const Problem = require('../models/FarmerProblem'), Advisory = require('../models/Advisory');
const days = (n) => new Date(Date.now() + n * 86400000);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User, Crop, Disease, Observation, Rec, Problem, Advisory].map((M) => M.deleteMany({})));

  const mk = (name, email, pw, role, location, phone) => User.create({ name, email, password: pw, role, location, phone });
  const admin = await mk('System Admin', 'admin@agri.com', 'Admin@123', 'admin', 'Chennai, Tamil Nadu', '9000000001');
  const e1 = await mk('Dr. Meena Krishnan', 'expert1@agri.com', 'Expert@123', 'expert', 'Coimbatore, Tamil Nadu', '9000000002');
  const e2 = await mk('Ravi Shankar (Field Officer)', 'expert2@agri.com', 'Expert@123', 'expert', 'Thanjavur, Tamil Nadu', '9000000003');
  const f1 = await mk('Murugan Selvam', 'farmer1@agri.com', 'Farmer@123', 'farmer', 'Thanjavur, Tamil Nadu', '9000000004');
  const f2 = await mk('Lakshmi Devi', 'farmer2@agri.com', 'Farmer@123', 'farmer', 'Madurai, Tamil Nadu', '9000000005');
  const f3 = await mk('Anwar Basha', 'farmer3@agri.com', 'Farmer@123', 'farmer', 'Salem, Tamil Nadu', '9000000006');

  await Crop.insertMany([
    { cropName: 'Rice', varietyName: 'ADT 45', category: 'Cereal', scientificName: 'Oryza sativa', season: 'Kharif', soilType: 'Clay loam', waterRequirement: '1200-1500 mm', temperatureRange: '20-35°C', expectedYield: '5.5 t/ha', diseaseResistance: 'Moderate resistance to blast', description: 'Short-duration, fine-grain rice variety popular in delta districts.', recommendedRegions: ['Thanjavur', 'Tiruvarur', 'Nagapattinam'], createdBy: e1._id },
    { cropName: 'Rice', varietyName: 'CO 51', category: 'Cereal', scientificName: 'Oryza sativa', season: 'Rabi', soilType: 'Clay / alluvial', waterRequirement: '1100-1400 mm', temperatureRange: '20-34°C', expectedYield: '6.0 t/ha', diseaseResistance: 'Tolerant to brown planthopper', description: 'High-yielding, medium-duration variety.', recommendedRegions: ['Madurai', 'Trichy'], createdBy: e1._id },
    { cropName: 'Tomato', varietyName: 'Arka Rakshak', category: 'Vegetable', scientificName: 'Solanum lycopersicum', season: 'Year-round', soilType: 'Well-drained sandy loam', waterRequirement: '600-800 mm', temperatureRange: '18-30°C', expectedYield: '75 t/ha', diseaseResistance: 'Resistant to leaf curl virus, bacterial wilt and early blight', description: 'Hybrid with multiple disease resistance and firm fruits.', recommendedRegions: ['Salem', 'Krishnagiri', 'Dharmapuri'], createdBy: e2._id },
    { cropName: 'Cotton', varietyName: 'Bt Hybrid RCH 659', category: 'Cash Crop', scientificName: 'Gossypium hirsutum', season: 'Kharif', soilType: 'Black cotton soil', waterRequirement: '700-1000 mm', temperatureRange: '21-35°C', expectedYield: '2.5 t/ha', diseaseResistance: 'Bollworm protection (Bt trait)', description: 'Bt cotton hybrid for rain-fed and irrigated conditions.', recommendedRegions: ['Madurai', 'Virudhunagar'], createdBy: e1._id },
    { cropName: 'Groundnut', varietyName: 'TMV 7', category: 'Oilseed', scientificName: 'Arachis hypogaea', season: 'Rabi', soilType: 'Red sandy loam', waterRequirement: '500-600 mm', temperatureRange: '22-32°C', expectedYield: '2.2 t/ha', diseaseResistance: 'Tolerant to rust and leaf spot', description: 'Bunch-type groundnut suited for light soils.', recommendedRegions: ['Salem', 'Namakkal'], createdBy: e2._id },
    { cropName: 'Banana', varietyName: 'Grand Naine (tissue culture)', category: 'Fruit', scientificName: 'Musa acuminata', season: 'Perennial', soilType: 'Deep loam', waterRequirement: '1800-2200 mm', temperatureRange: '20-35°C', expectedYield: '55 t/ha', diseaseResistance: 'Disease-free planting material through tissue culture', description: 'Tissue-cultured plantlets give uniform growth and cleaner planting stock.', recommendedRegions: ['Theni', 'Trichy'], createdBy: e1._id },
  ]);

  const dis = await Disease.insertMany([
    { diseaseName: 'Rice Blast', crop: 'Rice', symptoms: 'Diamond-shaped grey lesions on leaves; neck rot at panicle stage.', causes: 'Fungus Magnaporthe oryzae; favoured by high humidity and excess nitrogen.', severity: 'High', status: 'Active', preventionMethods: 'Use resistant varieties, balanced nitrogen, avoid dense planting.', treatment: 'Seed treatment with Pseudomonas fluorescens; consult an expert before any fungicide use.', environmentalConditions: 'Humidity above 90%, 20-28°C', location: 'Thanjavur', dateReported: days(-10), reportedBy: e2._id },
    { diseaseName: 'Tomato Leaf Curl Virus', crop: 'Tomato', symptoms: 'Upward leaf curling, stunting, yellowing.', causes: 'Begomovirus spread by whitefly (Bemisia tabaci).', severity: 'Critical', status: 'Active', preventionMethods: 'Use virus-resistant hybrids, yellow sticky traps, rogue infected plants.', treatment: 'Resistant variety adoption; neem-based biopesticide for whitefly management.', environmentalConditions: 'Hot, dry weather 28-35°C', location: 'Salem', dateReported: days(-6), reportedBy: e1._id },
    { diseaseName: 'Groundnut Leaf Spot', crop: 'Groundnut', symptoms: 'Brown circular spots with yellow halo on leaves.', causes: 'Cercospora fungi.', severity: 'Medium', status: 'Under Control', preventionMethods: 'Crop rotation and clean seed.', treatment: 'Trichoderma viride seed treatment.', environmentalConditions: 'Warm, humid', location: 'Namakkal', dateReported: days(-20), reportedBy: e2._id },
    { diseaseName: 'Fusarium Wilt (Panama disease)', crop: 'Banana', symptoms: 'Yellowing of older leaves, vascular browning in pseudostem.', causes: 'Soil-borne Fusarium oxysporum.', severity: 'High', status: 'Active', preventionMethods: 'Use tissue-cultured disease-free plantlets; avoid infected fields.', treatment: 'Soil microbial management with Bacillus-based biocontrol agents.', environmentalConditions: 'Warm, poorly drained soil', location: 'Theni', dateReported: days(-3), reportedBy: e1._id },
    { diseaseName: 'Cotton Pink Bollworm', crop: 'Cotton', symptoms: 'Rosette flowers, damaged bolls with larvae.', causes: 'Pectinophora gossypiella.', severity: 'Medium', status: 'Resolved', preventionMethods: 'Pheromone traps, timely sowing.', treatment: 'Bt cotton refuge strategy and biological control.', environmentalConditions: 'Late-season warm weather', location: 'Madurai', dateReported: days(-40), reportedBy: e2._id },
  ]);

  await Observation.insertMany([
    { farmerName: 'Murugan Selvam', location: 'Thanjavur - Block 4', crop: 'Rice', cropVariety: 'ADT 45', growthStage: 'Flowering', soilCondition: 'Moist clay loam', weatherCondition: 'Humid, light drizzle', pestDiseaseSymptoms: 'Few leaf lesions observed', plantHealth: 'Fair', notes: 'Monitor for blast; advised balanced nitrogen.', observationDate: days(-5), gps: '10.7870,79.1378', observedBy: e2._id },
    { farmerName: 'Anwar Basha', location: 'Salem - Village 12', crop: 'Tomato', cropVariety: 'Arka Rakshak', growthStage: 'Fruiting', soilCondition: 'Sandy loam, well drained', weatherCondition: 'Hot and dry', pestDiseaseSymptoms: 'Whitefly presence', plantHealth: 'Good', notes: 'Resistant variety performing well.', observationDate: days(-4), gps: '11.6643,78.1460', observedBy: e1._id },
    { farmerName: 'Lakshmi Devi', location: 'Madurai - East', crop: 'Cotton', cropVariety: 'Bt Hybrid RCH 659', growthStage: 'Vegetative', soilCondition: 'Black soil, adequate moisture', weatherCondition: 'Sunny', pestDiseaseSymptoms: 'None', plantHealth: 'Excellent', notes: 'Healthy stand, uniform growth.', observationDate: days(-2), observedBy: e1._id },
  ]);

  await Rec.insertMany([
    { crop: 'Rice', cropVariety: 'ADT 45', problem: 'Rice Blast', title: 'Pseudomonas fluorescens seed treatment', method: 'Biopesticide', description: 'Seed treatment with a Pseudomonas fluorescens formulation is a commonly used biological option to help suppress blast pressure as part of integrated disease management.', requiredInputs: 'P. fluorescens powder, clean water, seed', applicationMethod: 'Mix 10 g per kg of seed and shade-dry for 30 minutes before sowing.', expectedBenefits: 'May reduce early disease incidence and chemical dependence.', precautions: 'Use within shelf life; follow label guidance; not a substitute for expert diagnosis.', growthStage: 'Pre-sowing', expertName: e1.name, createdBy: e1._id },
    { crop: 'Banana', problem: 'Fusarium Wilt', title: 'Tissue-cultured, disease-free planting material', method: 'Tissue Culture', description: 'Tissue-culture plantlets from accredited labs give clean, uniform planting stock and lower the risk of introducing soil- and sucker-borne pathogens.', requiredInputs: 'Accredited tissue-culture plantlets', applicationMethod: 'Harden plantlets, transplant to well-drained field.', expectedBenefits: 'Uniform growth and cleaner starting material.', precautions: 'Buy only from accredited suppliers; avoid fields with known infection.', growthStage: 'Planting', expertName: e1.name, createdBy: e1._id },
    { crop: 'Groundnut', problem: 'Nutrient uptake', title: 'Rhizobium + PSB biofertilizer', method: 'Biofertilizer', description: 'Seed inoculation with Rhizobium and phosphate-solubilising bacteria supports nitrogen fixation and phosphorus availability.', requiredInputs: 'Rhizobium and PSB cultures, jaggery solution', applicationMethod: 'Coat seeds with culture slurry; sow the same day.', expectedBenefits: 'Supports soil fertility and may reduce fertilizer requirement.', precautions: 'Do not mix with chemical seed treatments before inoculation.', growthStage: 'Sowing', expertName: e2.name, createdBy: e2._id },
    { crop: 'Tomato', problem: 'Whitefly', title: 'Neem-based biopesticide with sticky traps', method: 'Biological Crop Protection', description: 'Combine yellow sticky traps with neem-based biopesticide sprays as part of integrated pest management for whitefly.', requiredInputs: 'Neem formulation, yellow sticky traps', applicationMethod: 'Spray in the evening; install 20 traps per acre.', expectedBenefits: 'Lower whitefly pressure with reduced chemical use.', precautions: 'Test on a few plants first; avoid spraying at peak heat.', growthStage: 'Vegetative to fruiting', expertName: e1.name, createdBy: e1._id },
  ]);

  const [p1, p2] = await Problem.insertMany([
    { farmer: f1._id, crop: 'Rice', cropVariety: 'ADT 45', location: 'Thanjavur', category: 'Disease', description: 'Grey spots spreading on leaves after recent rain.', symptoms: 'Diamond-shaped lesions', dateObserved: days(-7), status: 'Advisory Issued' },
    { farmer: f2._id, crop: 'Cotton', cropVariety: 'Bt Hybrid RCH 659', location: 'Madurai', category: 'Pest', description: 'Small holes in some bolls.', symptoms: 'Bore holes in bolls', dateObserved: days(-2), status: 'Open' },
    { farmer: f3._id, crop: 'Tomato', cropVariety: 'Arka Rakshak', location: 'Salem', category: 'Nutrient Deficiency', description: 'Lower leaves turning yellow.', symptoms: 'Interveinal yellowing', dateObserved: days(-1), status: 'Open' },
  ]);

  await Advisory.insertMany([
    { farmer: f1._id, expert: e1._id, problem: p1._id, crop: 'Rice', cropVariety: 'ADT 45', field: 'Block 4', problemIdentified: 'Suspected rice blast', recommendedAction: 'Reduce nitrogen top-dressing and apply Pseudomonas fluorescens as advised.', priority: 'High', message: 'Please remove severely affected tillers, keep water levels steady and re-check in one week.', followUpDate: days(5), status: 'In Progress' },
    { farmer: f3._id, expert: e2._id, crop: 'Tomato', cropVariety: 'Arka Rakshak', field: 'Village 12', problemIdentified: 'Whitefly build-up', recommendedAction: 'Install yellow sticky traps; use neem-based spray.', priority: 'Medium', message: 'Inspect undersides of leaves twice a week.', followUpDate: days(8), status: 'Pending' },
    { farmer: f2._id, expert: e1._id, crop: 'Cotton', field: 'East plot', problemIdentified: 'Routine crop health guidance', recommendedAction: 'Continue scouting and pheromone traps.', priority: 'Low', message: 'Stand looks healthy. Keep monitoring for bollworm.', followUpDate: days(14), status: 'Resolved' },
  ]);

  console.log('Seed complete. Users: admin@agri.com / Admin@123, expert1@agri.com / Expert@123, farmer1@agri.com / Farmer@123');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
