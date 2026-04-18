const Complaint = require('../models/Complaint');

exports.getOverview = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });
    const escalated = await Complaint.countDocuments({ isEscalated: true });
    const urgent = await Complaint.countDocuments({ priority: 'Urgent' });

    // By category
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // By village (top 10) with pending count
    const byVillage = await Complaint.aggregate([
      {
        $group: {
          _id: '$village',
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // By district
    const byDistrict = await Complaint.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent escalated complaints
    const recentEscalated = await Complaint.find({ isEscalated: true })
      .populate('userId', 'name village')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        total, pending, inProgress, resolved, rejected,
        escalated, urgent, byCategory, byVillage, byDistrict, recentEscalated,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVillageStats = async (req, res) => {
  try {
    const village = req.user.village;
    if (!village) return res.status(400).json({ success: false, message: 'Village not set in your profile' });

    const total = await Complaint.countDocuments({ village });
    const pending = await Complaint.countDocuments({ village, status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ village, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ village, status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ village, status: 'Rejected' });
    const escalated = await Complaint.countDocuments({ village, isEscalated: true });

    const byCategory = await Complaint.aggregate([
      { $match: { village } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recent = await Complaint.find({ village })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      data: { total, pending, inProgress, resolved, rejected, escalated, byCategory, recent },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
