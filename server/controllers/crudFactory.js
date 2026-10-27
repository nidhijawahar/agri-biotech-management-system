const { asyncHandler, httpError, escapeRegex } = require('../utils/helpers');

module.exports = (cfg) => {
  const { Model, searchFields = [], filterFields = [], partialFields = [], arrayFields = [], populate = [], sort = '-createdAt', dateField, lock = [] } = cfg;
  const scope = (u) => (cfg.scope ? cfg.scope(u) : {});
  const writeScope = (u) => (cfg.writeScope ? cfg.writeScope(u) : {});
  const deleteScope = (u) => (cfg.deleteScope ? cfg.deleteScope(u) : writeScope(u));
  const files = (req) => (req.files || []).map((f) => '/uploads/' + f.filename);

  const cleanBody = (req, isUpdate) => {
    const b = { ...req.body };
    ['_id', '__v', 'createdAt', 'updatedAt', 'images', ...(isUpdate ? lock : [])].forEach((k) => delete b[k]);
    if (cfg.sanitize) cfg.sanitize(b, req.user, isUpdate);
    arrayFields.forEach((k) => { if (typeof b[k] === 'string') b[k] = b[k].split(',').map((s) => s.trim()).filter(Boolean); });
    if (!isUpdate) Object.keys(b).forEach((k) => b[k] === '' && delete b[k]);
    return b;
  };

  return {
    list: asyncHandler(async (req, res) => {
      const q = { ...scope(req.user) };
      if (req.query.q) q.$or = searchFields.map((f) => ({ [f]: new RegExp(escapeRegex(req.query.q), 'i') }));
      filterFields.forEach((f) => { if (req.query[f]) q[f] = req.query[f]; });
      partialFields.forEach((f) => { if (req.query[f]) q[f] = new RegExp(escapeRegex(req.query[f]), 'i'); });
      if (dateField && (req.query.from || req.query.to)) {
        q[dateField] = {};
        if (req.query.from) q[dateField].$gte = new Date(req.query.from);
        if (req.query.to) q[dateField].$lte = new Date(req.query.to + 'T23:59:59.999Z');
      }
      const page = Math.max(1, +req.query.page || 1), limit = Math.min(100, +req.query.limit || 10);
      const [items, total] = await Promise.all([
        Model.find(q).populate(populate).sort(sort).skip((page - 1) * limit).limit(limit),
        Model.countDocuments(q),
      ]);
      res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
    }),

    get: asyncHandler(async (req, res) => {
      const doc = await Model.findOne({ _id: req.params.id, ...scope(req.user) }).populate(populate);
      if (!doc) throw httpError(404, 'Record not found');
      res.json(doc);
    }),

    create: asyncHandler(async (req, res) => {
      const b = cleanBody(req, false);
      if (cfg.onCreate) Object.assign(b, cfg.onCreate(req.user, b));
      const f = files(req);
      if (f.length && Model.schema.path('images')) b.images = f;
      const doc = await Model.create(b);
      if (cfg.afterCreate) await cfg.afterCreate(doc, req.user);
      res.status(201).json(await Model.findById(doc._id).populate(populate));
    }),

    update: asyncHandler(async (req, res) => {
      const doc = await Model.findOne({ _id: req.params.id, ...writeScope(req.user) });
      if (!doc) throw httpError(404, 'Record not found or you are not allowed to edit it');
      doc.set(cleanBody(req, true));
      const f = files(req);
      if (f.length && Model.schema.path('images')) doc.images = [...(doc.images || []), ...f].slice(0, 10);
      await doc.save();
      res.json(await Model.findById(doc._id).populate(populate));
    }),

    remove: asyncHandler(async (req, res) => {
      const doc = await Model.findOneAndDelete({ _id: req.params.id, ...deleteScope(req.user) });
      if (!doc) throw httpError(404, 'Record not found or you are not allowed to delete it');
      res.json({ message: 'Deleted successfully' });
    }),
  };
};
