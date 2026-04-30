const express = require('express');
const router = express.Router();
const {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  claimEntry,
} = require('../controllers/lostFoundController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('images', 5), createEntry);
router.get('/', protect, getEntries);
router.get('/:id', protect, getEntryById);
router.put('/:id', protect, updateEntry);
router.delete('/:id', protect, deleteEntry);
router.put('/:id/claim', protect, claimEntry);

module.exports = router;