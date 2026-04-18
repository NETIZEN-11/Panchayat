const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment, type, complaintId } = req.body;

    const feedback = await Feedback.create({
      userId: req.user.id,
      rating,
      comment,
      type,
      complaintId
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Private/Admin
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('userId', 'name email')
      .populate('complaintId', 'title')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: feedback.length,
      averageRating: avgRating[0]?.averageRating.toFixed(1) || 0,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
