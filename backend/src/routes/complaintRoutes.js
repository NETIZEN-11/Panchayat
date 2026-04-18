const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getVillageComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  escalateOldComplaints,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Citizen
router.post('/', protect, upload.array('images', 5), createComplaint);
router.get('/my-complaints', protect, getMyComplaints);

// Sarpanch (village-level)
router.get('/village', protect, authorize('sarpanch', 'admin'), getVillageComplaints);

// Government (all)
router.get('/all', protect, authorize('govt', 'sarpanch', 'admin'), getAllComplaints);

// Escalation tool (govt only)
router.post('/escalate', protect, authorize('govt'), escalateOldComplaints);

// Single complaint
router.get('/:id', protect, getComplaintById);
router.put('/:id', protect, authorize('sarpanch', 'admin', 'govt'), updateComplaintStatus);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
