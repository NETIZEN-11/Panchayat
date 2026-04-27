const express = require('express');
const router = express.Router();
const {
  getDirectoryEntries,
  createDirectoryEntry,
  updateDirectoryEntry,
  deleteDirectoryEntry,
} = require('../controllers/directoryController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getDirectoryEntries)
  .post(protect, authorize('sarpanch', 'govt', 'admin'), upload.single('image'), createDirectoryEntry);

router.route('/:id')
  .put(protect, authorize('sarpanch', 'govt', 'admin'), upload.single('image'), updateDirectoryEntry)
  .delete(protect, authorize('sarpanch', 'govt', 'admin'), deleteDirectoryEntry);

module.exports = router;
