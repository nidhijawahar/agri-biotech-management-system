const express = require('express');
const crud = require('../controllers/crudFactory');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const { httpError } = require('../utils/helpers');
const User = require('../models/User'), Crop = require('../models/Crop'), Disease = require('../models/Disease');
const Observation = require('../models/FieldObservation'), Recommendation = require('../models/BiotechnologyRecommendation');
const Problem = require('../models/FarmerProblem'), Advisory = require('../models/Advisory');

const A = 'admin', E = 'expert', F = 'farmer', ALL = [A, E, F], AE = [A, E];
const isFarmer = (u) => u.role === 'farmer';

function build(cfg, perm, hasUpload, extra) {
  const c = crud(cfg), r = express.Router();
  const up = hasUpload ? upload.array('images', 5) : (req, res, next) => next();
  r.use(protect);
  if (extra) extra(r);
  r.get('/', authorize(...perm.read), c.list);
  r.post('/', authorize(...perm.create), up, c.create);
  r.get('/:id', authorize(...perm.read), c.get);
  r.put('/:id', authorize(...perm.update), up, c.update);
  r.delete('/:id', authorize(...perm.remove), c.remove);
  return r;
}

const users = build({
  Model: User, searchFields: ['name', 'email', 'location'], filterFields: ['role'], sanitize: (b) => { if (b.password === '') delete b.password; },
}, { read: [A], create: [A], update: [A], remove: [A] }, false, (r) => {
  r.get('/farmers', authorize(...AE), async (req, res, next) => {
    try { res.json(await User.find({ role: 'farmer' }).select('name location').sort('name')); } catch (e) { next(e); }
  });
  r.delete('/:id', (req, res, next) => (req.params.id === String(req.user._id) ? next(httpError(400, 'You cannot delete your own account')) : next()));
});

const crops = build({
  Model: Crop, searchFields: ['cropName', 'varietyName', 'scientificName', 'description', 'recommendedRegions'], filterFields: ['category', 'season'],
  partialFields: ['cropName'], arrayFields: ['recommendedRegions'], lock: ['createdBy'], onCreate: (u) => ({ createdBy: u._id }),
}, { read: ALL, create: AE, update: AE, remove: AE }, true);

const diseases = build({
  Model: Disease, searchFields: ['diseaseName', 'crop', 'symptoms', 'location', 'causes'], filterFields: ['severity', 'status'], partialFields: ['crop', 'location'],
  dateField: 'dateReported', sort: '-dateReported', lock: ['reportedBy'], populate: [{ path: 'reportedBy', select: 'name' }], onCreate: (u) => ({ reportedBy: u._id }),
}, { read: ALL, create: AE, update: AE, remove: AE }, true);

const observations = build({
  Model: Observation, searchFields: ['farmerName', 'location', 'crop', 'cropVariety', 'notes', 'pestDiseaseSymptoms'], filterFields: ['plantHealth', 'growthStage'], partialFields: ['crop', 'location'],
  dateField: 'observationDate', sort: '-observationDate', lock: ['observedBy'], populate: [{ path: 'observedBy', select: 'name' }], onCreate: (u) => ({ observedBy: u._id }),
}, { read: AE, create: AE, update: AE, remove: AE }, true);

const recommendations = build({
  Model: Recommendation, searchFields: ['title', 'crop', 'problem', 'description', 'method'], filterFields: ['method'], partialFields: ['crop'], lock: ['createdBy'],
  onCreate: (u, b) => ({ createdBy: u._id, expertName: b.expertName || u.name }),
}, { read: ALL, create: AE, update: AE, remove: AE }, false);

const advisories = build({
  Model: Advisory, searchFields: ['crop', 'problemIdentified', 'message', 'field', 'recommendedAction'], filterFields: ['status', 'priority'], partialFields: ['crop'],
  scope: (u) => (isFarmer(u) ? { farmer: u._id } : {}), lock: ['expert', 'problem'], sort: '-createdAt',
  populate: [{ path: 'farmer', select: 'name location' }, { path: 'expert', select: 'name' }], onCreate: (u) => ({ expert: u._id }),
  afterCreate: async (doc) => { if (doc.problem) await Problem.findByIdAndUpdate(doc.problem, { status: 'Advisory Issued' }); },
}, { read: ALL, create: AE, update: AE, remove: AE }, false);

const problems = build({
  Model: Problem, searchFields: ['crop', 'cropVariety', 'location', 'description', 'symptoms'], filterFields: ['status', 'category'], partialFields: ['crop', 'location'],
  dateField: 'dateObserved', scope: (u) => (isFarmer(u) ? { farmer: u._id } : {}),
  writeScope: (u) => (isFarmer(u) ? { farmer: u._id, status: 'Open' } : {}), deleteScope: (u) => (isFarmer(u) ? { farmer: u._id } : {}),
  lock: ['farmer'], sanitize: (b, u) => { if (isFarmer(u)) delete b.status; delete b.farmer; },
  populate: [{ path: 'farmer', select: 'name phone location' }], onCreate: (u) => ({ farmer: u._id, status: 'Open' }),
}, { read: ALL, create: [F], update: ALL, remove: [A, F] }, true);

module.exports = { users, crops, diseases, observations, recommendations, advisories, problems };
