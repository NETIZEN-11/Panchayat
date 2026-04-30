const express = require('express');
const router = express.Router();
const {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  addMaintenance,
} = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('sarpanch', 'govt', 'admin'), upload.single('image'), createAsset);
router.get('/', protect, getAssets);
router.get('/:id', protect, getAssetById);
router.put('/:id', protect, authorize('sarpanch', 'govt', 'admin'), updateAsset);
router.delete('/:id', protect, authorize('sarpanch', 'govt', 'admin'), deleteAsset);
router.put('/:id/maintenance', protect, authorize('sarpanch', 'govt', 'admin'), addMaintenance);

module.exports = router;