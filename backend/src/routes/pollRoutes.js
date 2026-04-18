const express = require('express');
const router = express.Router();
const {
  getPolls,
  createPoll,
  votePoll
} = require('../controllers/pollController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getPolls)
  .post(protect, authorize('admin'), createPoll);

router.post('/:id/vote', protect, votePoll);

module.exports = router;
