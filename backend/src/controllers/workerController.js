const Worker = require('../models/Worker');

// @desc    Get workers by village and optional department
// @route   GET /api/workers
// @access  Private (Admin/Sarpanch)
exports.getWorkers = async (req, res) => {
  try {
    const { village, department } = req.query;
    const filter = { isActive: true };
    if (village) filter.village = village;
    if (department) filter.department = department;

    const workers = await Worker.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: workers.length, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a worker
// @route   POST /api/workers
// @access  Private (Admin/Sarpanch)
exports.createWorker = async (req, res) => {
  try {
    const { name, phone, department, village } = req.body;
    if (!name || !phone || !department || !village) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    const worker = await Worker.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a worker
// @route   PUT /api/workers/:id
// @access  Private (Admin/Sarpanch)
exports.updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    Object.assign(worker, req.body);
    await worker.save();
    res.status(200).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a worker (soft delete)
// @route   DELETE /api/workers/:id
// @access  Private (Admin/Sarpanch)
exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    worker.isActive = false;
    await worker.save();
    res.status(200).json({ success: true, message: 'Worker deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
