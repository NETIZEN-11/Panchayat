const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getWorkers, createWorker, updateWorker, deleteWorker } = require('../controllers/workerController');

router.use(protect);
router.use(authorize('admin', 'sarpanch'));

router.route('/').get(getWorkers).post(createWorker);
router.route('/:id').put(updateWorker).delete(deleteWorker);

module.exports = router;
