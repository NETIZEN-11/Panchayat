const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  addComment,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getAnnouncements)
  .post(protect, authorize('sarpanch', 'govt', 'admin'), upload.single('image'), createAnnouncement);

router.post('/:id/comments', protect, addComment);

module.exports = router;
