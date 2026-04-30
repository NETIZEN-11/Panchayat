const express = require('express');
const router = express.Router();
const {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  getActiveAlerts,
} = require('../controllers/emergencyAlertController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('sarpanch', 'govt', 'admin'), createAlert);
router.get('/', protect, getAlerts);
router.get('/active', protect, getActiveAlerts);
router.get('/:id', protect, getAlertById);
router.put('/:id', protect, authorize('sarpanch', 'govt', 'admin'), updateAlert);
router.delete('/:id', protect, authorize('sarpanch', 'govt', 'admin'), deleteAlert);

module.exports = router;