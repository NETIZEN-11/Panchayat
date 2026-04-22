const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { sendNotification, sendToVillage } = require('../utils/notifications');

// Helper: normalize roles (support legacy user/admin)
const isCitizen = (role) => ['citizen', 'user'].includes(role);
const isSarpanch = (role) => ['sarpanch', 'admin'].includes(role);
const isGovt = (role) => role === 'govt';

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, latitude, longitude, otherDetails } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Duplicate check within 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await Complaint.findOne({ userId: req.user.id, title, createdAt: { $gte: since } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already submitted this complaint recently. Please wait for an update.',
      });
    }

    // Get user village/district
    const user = await User.findById(req.user.id);

    const complaintData = {
      userId: req.user.id,
      title,
      description,
      category,
      otherDetails: otherDetails || '',
      location,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      village: req.user.village || user?.village || 'Unknown',
      district: req.user.district || user?.district || 'General',
      images: [],
      timeline: [{ status: 'Pending', notes: 'Complaint submitted by citizen', updatedAt: new Date() }],
    };

    if (req.files && req.files.length > 0) {
      complaintData.images = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (req.file) {
      complaintData.images = [`/uploads/${req.file.filename}`];
    }

    const complaint = await Complaint.create(complaintData);

    // Notify the sarpanch about new complaint in their village
    const sarpanchVillage = complaintData.village;
    await sendToVillage(
      sarpanchVillage,
      `New Complaint: ${complaintData.title}`,
      `Category: ${complaintData.category}\nLocation: ${complaintData.location}\nSubmitted by: ${user?.name || 'Citizen'}`,
      'complaint',
      req.user.id
    );

    res.status(201).json({ success: true, message: 'Complaint submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Citizen: my complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sarpanch: village complaints
exports.getVillageComplaints = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    const filter = { village: req.user.village };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email phone village')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Govt: all complaints with region/status filters
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, village, district, escalated, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (village) filter.village = new RegExp(village, 'i');
    if (district) filter.district = new RegExp(district, 'i');
    if (escalated === 'true') filter.isEscalated = true;

    const skip = (page - 1) * limit;
    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email phone village district')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('userId', 'name email phone village');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, priority, adminNotes, assignedTo } = req.body;

    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (status && status !== complaint.status) {
      complaint.timeline.push({
        status,
        notes: adminNotes || `Status updated to ${status}`,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      });
      complaint.status = status;

      if (status === 'Resolved') complaint.resolvedAt = new Date();

      // Send notification to the citizen who filed the complaint
      await sendNotification(
        complaint.userId,
        'Complaint Status Updated',
        `Your complaint "${complaint.title}" is now ${status}.`,
        'complaint',
        complaint._id
      );

      // If sarpanch/govt updates, send village-wide notification about important status changes
      if (['Resolved', 'In Progress'].includes(status) && isSarpanch(req.user.role)) {
        await sendToVillage(
          complaint.village,
          `Complaint Update: ${complaint.title}`,
          `Status changed to "${status}"\nLocation: ${complaint.location}\nCategory: ${complaint.category}`,
          'complaint',
          req.user.id
        );
      }
    }

    if (priority) complaint.priority = priority;
    if (adminNotes) complaint.adminNotes = adminNotes;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo;

    complaint = await complaint.save();
    res.status(200).json({ success: true, message: 'Complaint updated', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const canDelete =
      complaint.userId.toString() === req.user.id ||
      isSarpanch(req.user.role) ||
      isGovt(req.user.role);

    if (!canDelete) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this complaint' });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Complaint deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Auto-escalate complaints older than X days (can be called by a cron or manually)
exports.escalateOldComplaints = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const updated = await Complaint.updateMany(
      { status: 'Pending', isEscalated: false, createdAt: { $lte: cutoff } },
      { $set: { isEscalated: true, escalatedAt: new Date(), priority: 'Urgent' } }
    );

    res.status(200).json({ success: true, message: `Escalated ${updated.modifiedCount} complaints`, count: updated.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/ /   E m o j i   r e m o v a l   -   C o m m i t   1 7  
 / /   F i n a l   e m o j i   r e m o v a l   p a s s   -   C o m m i t   3 1  
 