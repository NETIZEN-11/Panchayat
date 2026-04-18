const express = require('express');
const router = express.Router();
const { getOverview, getVillageStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/overview', protect, authorize('govt'), getOverview);
router.get('/village', protect, authorize('sarpanch', 'admin'), getVillageStats);

module.exports = router;
