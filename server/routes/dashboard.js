const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/dashboardController');
router.use(protect);
router.get('/dashboard', c.stats);
router.get('/dashboard/diseases', authorize('admin', 'expert'), c.diseaseStats);
router.get('/search', c.search);
module.exports = router;
