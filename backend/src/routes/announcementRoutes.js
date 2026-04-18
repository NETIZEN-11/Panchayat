const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  addComment
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAnnouncements)
  .post(protect, authorize('admin'), createAnnouncement);

router.post('/:id/comments', protect, addComment);

module.exports = router;
