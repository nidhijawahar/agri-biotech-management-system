const multer = require('multer'), path = require('path'), crypto = require('crypto');
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, f, cb) => cb(null, Date.now() + '-' + crypto.randomBytes(8).toString('hex') + EXT[f.mimetype]),
});
module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, f, cb) => EXT[f.mimetype] ? cb(null, true) : cb(Object.assign(new Error('Only JPG, PNG or WEBP images are allowed'), { status: 400 })),
});
