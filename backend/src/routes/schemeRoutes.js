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
  .post(protect, authorize('admin'), createScheme);

router.route('/:id')
  .get(getSchemeById)
  .put(protect, authorize('admin'), updateScheme)
  .delete(protect, authorize('admin'), deleteScheme);

module.exports = router;
