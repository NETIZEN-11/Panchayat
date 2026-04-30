const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getMyDocuments,
  getDocuments,
  getDocumentById,
  verifyDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('documentImage'), uploadDocument);
router.get('/my-documents', protect, getMyDocuments);
router.get('/', protect, authorize('sarpanch', 'govt', 'admin'), getDocuments);
router.get('/:id', protect, getDocumentById);
router.put('/:id/verify', protect, authorize('sarpanch', 'govt', 'admin'), verifyDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;