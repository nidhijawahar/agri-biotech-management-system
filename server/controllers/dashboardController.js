const { asyncHandler, escapeRegex } = require('../utils/helpers');
const User = require('../models/User'), Crop = require('../models/Crop'), Disease = require('../models/Disease');
const Observation = require('../models/FieldObservation'), Recommendation = require('../models/BiotechnologyRecommendation');
const Problem = require('../models/FarmerProblem'), Advisory = require('../models/Advisory');

const d = (v) => (v ? new Date(v).toLocaleDateString('en-IN') : '');
const group = (Model, field, match = {}) =>
  Model.aggregate([{ $match: match }, { $group: { _id: '$' + field, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }])
    .then((r) => r.map((x) => ({ name: x._id || 'Unknown', count: x.count })));
const item = {
  obs: (o) => ({ id: o._id, primary: `${o.crop} — ${o.location}`, secondary: `${o.farmerName} · ${d(o.observationDate)}`, badge: o.plantHealth }),
  disease: (x) => ({ id: x._id, primary: `${x.diseaseName} (${x.crop})`, secondary: `${x.location || '—'} · ${d(x.dateReported)}`, badge: x.severity }),
  problem: (p) => ({ id: p._id, primary: `${p.crop} — ${p.category}`, secondary: `${(p.farmer && p.farmer.name) || ''} · ${p.location}`, badge: p.status }),
  adv: (a) => ({ id: a._id, primary: `${a.crop}: ${a.problemIdentified}`, secondary: `Follow-up: ${d(a.followUpDate) || '—'}`, badge: a.status }),
  rec: (r) => ({ id: r._id, primary: r.title, secondary: `${r.crop} · ${r.method}`, badge: '' }),
};

exports.stats = asyncHandler(async (req, res) => {
  const u = req.user;
  if (u.role === 'admin') {
    const [users, farmers, experts, crops, diseases, observations, advisories, dByCrop, pByStatus, uByRole, recent] = await Promise.all([
      User.countDocuments(), User.countDocuments({ role: 'farmer' }), User.countDocuments({ role: 'expert' }), Crop.countDocuments(),
      Disease.countDocuments(), Observation.countDocuments(), Advisory.countDocuments(),
      group(Disease, 'crop'), group(Problem, 'status'), group(User, 'role'),
      Problem.find().sort('-createdAt').limit(5).populate('farmer', 'name'),
    ]);
    return res.json({
      cards: [
        { label: 'Total Users', value: users, icon: '👥' }, { label: 'Farmers', value: farmers, icon: '🧑‍🌾' }, { label: 'Experts', value: experts, icon: '🔬' },
        { label: 'Crop Varieties', value: crops, icon: '🌾' }, { label: 'Disease Reports', value: diseases, icon: '🦠' },
        { label: 'Field Observations', value: observations, icon: '📋' }, { label: 'Advisories', value: advisories, icon: '💬' },
      ],
      charts: [{ title: 'Disease reports by crop', type: 'bar', data: dByCrop }, { title: 'Users by role', type: 'pie', data: uByRole }, { title: 'Farmer problems by status', type: 'pie', data: pByStatus }],
      lists: [{ title: 'Latest farmer problems', items: recent.map(item.problem) }],
    });
  }
  if (u.role === 'expert') {
    const [myObs, diseases, pending, active, recentObs, recentDis, pendingList, dByCrop] = await Promise.all([
      Observation.countDocuments({ observedBy: u._id }), Disease.countDocuments(), Problem.countDocuments({ status: 'Open' }),
      Advisory.countDocuments({ expert: u._id, status: { $ne: 'Resolved' } }),
      Observation.find({ observedBy: u._id }).sort('-observationDate').limit(5),
      Disease.find().sort('-dateReported').limit(5), Problem.find({ status: 'Open' }).sort('-createdAt').limit(5).populate('farmer', 'name'),
      group(Disease, 'crop'),
    ]);
    return res.json({
      cards: [
        { label: 'My Field Observations', value: myObs, icon: '📋' }, { label: 'Disease Reports', value: diseases, icon: '🦠' },
        { label: 'Pending Farmer Problems', value: pending, icon: '⚠️' }, { label: 'Active Advisories', value: active, icon: '💬' },
      ],
      charts: [{ title: 'Disease reports by crop', type: 'bar', data: dByCrop }],
      lists: [
        { title: 'Pending farmer problems', items: pendingList.map(item.problem) },
        { title: 'Recent observations', items: recentObs.map(item.obs) },
        { title: 'Recent disease reports', items: recentDis.map(item.disease) },
      ],
    });
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [myProblems, active, crops1, crops2, recs, upcoming, pByStatus] = await Promise.all([
    Problem.countDocuments({ farmer: u._id }), Advisory.countDocuments({ farmer: u._id, status: { $ne: 'Resolved' } }),
    Problem.distinct('crop', { farmer: u._id }), Advisory.distinct('crop', { farmer: u._id }),
    Recommendation.find().sort('-createdAt').limit(5),
    Advisory.find({ farmer: u._id, status: { $ne: 'Resolved' }, followUpDate: { $gte: today } }).sort('followUpDate').limit(5),
    group(Problem, 'status', { farmer: u._id }),
  ]);
  const myCrops = [...new Set([...crops1, ...crops2])];
  res.json({
    cards: [{ label: 'My Crops', value: myCrops.length, icon: '🌱' }, { label: 'My Submitted Problems', value: myProblems, icon: '⚠️' }, { label: 'Active Advisories', value: active, icon: '💬' }],
    charts: [{ title: 'My problems by status', type: 'pie', data: pByStatus }],
    lists: [
      { title: 'My crops', items: myCrops.map((c) => ({ id: c, primary: c, secondary: '', badge: '' })) },
      { title: 'Upcoming follow-ups', items: upcoming.map(item.adv) },
      { title: 'Recent recommendations', items: recs.map(item.rec) },
    ],
  });
});

exports.diseaseStats = asyncHandler(async (req, res) => {
  const [total, active, high, byCrop, byLocation] = await Promise.all([
    Disease.countDocuments(), Disease.countDocuments({ status: 'Active' }), Disease.countDocuments({ severity: { $in: ['High', 'Critical'] } }),
    group(Disease, 'crop'), group(Disease, 'location'),
  ]);
  res.json({ total, active, high, byCrop, byLocation });
});

exports.search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ results: [] });
  const rx = new RegExp(escapeRegex(q), 'i'), u = req.user;
  const find = (M, f, filter = {}) => M.find({ ...filter, $or: f.map((k) => ({ [k]: rx })) }).limit(6).lean();
  const [crops, diseases, recs, obs, advs] = await Promise.all([
    find(Crop, ['cropName', 'varietyName', 'scientificName', 'description']),
    find(Disease, ['diseaseName', 'crop', 'symptoms', 'location']),
    find(Recommendation, ['title', 'crop', 'problem', 'description', 'method']),
    u.role === 'farmer' ? [] : find(Observation, ['crop', 'farmerName', 'location', 'notes', 'pestDiseaseSymptoms']),
    find(Advisory, ['crop', 'problemIdentified', 'message', 'field'], u.role === 'farmer' ? { farmer: u._id } : {}),
  ]);
  const out = [
    { module: 'Crop Varieties', path: '/crops', items: crops.map((c) => ({ id: c._id, primary: `${c.cropName} — ${c.varietyName}`, secondary: `${c.category} · ${c.season}` })) },
    { module: 'Diseases', path: '/diseases', items: diseases.map((x) => ({ id: x._id, primary: `${x.diseaseName} (${x.crop})`, secondary: `${x.severity} · ${x.location || ''}` })) },
    { module: 'Recommendations', path: '/recommendations', items: recs.map((r) => ({ id: r._id, primary: r.title, secondary: `${r.crop} · ${r.method}` })) },
    { module: 'Field Observations', path: '/observations', items: obs.map((o) => ({ id: o._id, primary: `${o.crop} — ${o.location}`, secondary: o.farmerName })) },
    { module: 'Advisories', path: '/advisories', items: advs.map((a) => ({ id: a._id, primary: `${a.crop}: ${a.problemIdentified}`, secondary: a.status })) },
  ].filter((g) => g.items.length);
  res.json({ results: out });
});
