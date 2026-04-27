const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme
} = require('../controllers/schemeController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAllSchemes)
  .post(protect, authorize('sarpanch', 'govt', 'admin'), createScheme);

router.route('/:id')
  .get(getSchemeById)
  .put(protect, authorize('sarpanch', 'govt', 'admin'), updateScheme)
  .delete(protect, authorize('sarpanch', 'govt', 'admin'), deleteScheme);

module.exports = router;
