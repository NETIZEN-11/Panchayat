const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
} = require('../controllers/schemeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getAllSchemes)
  .post(protect, authorize('sarpanch', 'govt', 'admin'), upload.single('image'), createScheme);

router.route('/:id')
  .get(getSchemeById)
  .put(protect, authorize('sarpanch', 'govt', 'admin'), upload.single('image'), updateScheme)
  .delete(protect, authorize('sarpanch', 'govt', 'admin'), deleteScheme);

module.exports = router;
