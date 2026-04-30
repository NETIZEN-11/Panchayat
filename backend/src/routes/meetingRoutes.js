const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  markAttendance,
} = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('sarpanch', 'govt', 'admin'), createMeeting);
router.get('/', protect, getMeetings);
router.get('/:id', protect, getMeetingById);
router.put('/:id', protect, authorize('sarpanch', 'govt', 'admin'), updateMeeting);
router.delete('/:id', protect, authorize('sarpanch', 'govt', 'admin'), deleteMeeting);
router.put('/:id/attendance', protect, authorize('sarpanch', 'govt', 'admin'), markAttendance);

module.exports = router;