const express = require('express');
const router = express.Router();
const {
  getDirectoryEntries,
  createDirectoryEntry,
  updateDirectoryEntry,
  deleteDirectoryEntry
} = require('../controllers/directoryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getDirectoryEntries)
  .post(protect, authorize('admin'), createDirectoryEntry);

router.route('/:id')
  .put(protect, authorize('admin'), updateDirectoryEntry)
  .delete(protect, authorize('admin'), deleteDirectoryEntry);

module.exports = router;
