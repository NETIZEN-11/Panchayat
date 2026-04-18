const Directory = require('../models/Directory');

// @desc    Get all directory entries
// @route   GET /api/directory
// @access  Public
exports.getDirectoryEntries = async (req, res) => {
  try {
    const { category, village, search } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (village) query.village = village;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const entries = await Directory.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create directory entry
// @route   POST /api/directory
// @access  Private/Admin
exports.createDirectoryEntry = async (req, res) => {
  try {
    const entry = await Directory.create({
      ...req.body,
      addedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Directory entry created successfully',
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update directory entry
// @route   PUT /api/directory/:id
// @access  Private/Admin
exports.updateDirectoryEntry = async (req, res) => {
  try {
    const entry = await Directory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Directory entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Directory entry updated successfully',
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete directory entry
// @route   DELETE /api/directory/:id
// @access  Private/Admin
exports.deleteDirectoryEntry = async (req, res) => {
  try {
    const entry = await Directory.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Directory entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Directory entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
