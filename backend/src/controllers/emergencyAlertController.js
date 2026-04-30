const EmergencyAlert = require('../models/EmergencyAlert');
const User = require('../models/User');
const { sendToVillage } = require('../utils/notifications');

exports.createAlert = async (req, res) => {
  try {
    const { title, description, type, severity, location, instructions, village, expiresAt, affectedArea, contactNumber } = req.body;

    if (!title || !description || !type || !village) {
      return res.status(400).json({ success: false, message: 'Please provide required fields' });
    }

    const alertData = {
      title,
      description,
      type,
      severity: severity || 'medium',
      location: location || {},
      instructions: instructions || '',
      village,
      affectedArea: affectedArea || '',
      contactNumber: contactNumber || '',
      createdBy: req.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    const alert = await EmergencyAlert.create(alertData);

    await sendToVillage(
      village,
      `🚨 EMERGENCY: ${title}`,
      `${description}\n\nType: ${type}\nSeverity: ${severity}\nLocation: ${location?.village || village}`,
      'emergency',
      req.user.id
    );

    res.status(201).json({ success: true, message: 'Emergency alert created', alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const { village, type, severity, active, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (village) filter.village = new RegExp(village, 'i');
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (active === 'true') filter.isActive = true;

    const skip = (page - 1) * limit;
    const alerts = await EmergencyAlert.find(filter)
      .populate('createdBy', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EmergencyAlert.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAlertById = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id).populate('createdBy', 'name phone');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.status(200).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    let alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    if (!['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, type, severity, location, instructions, isActive, expiresAt, affectedArea, contactNumber } = req.body;

    if (title) alert.title = title;
    if (description) alert.description = description;
    if (type) alert.type = type;
    if (severity) alert.severity = severity;
    if (location) alert.location = location;
    if (instructions) alert.instructions = instructions;
    if (isActive !== undefined) alert.isActive = isActive;
    if (expiresAt) alert.expiresAt = new Date(expiresAt);
    if (affectedArea) alert.affectedArea = affectedArea;
    if (contactNumber) alert.contactNumber = contactNumber;

    alert = await alert.save();
    res.status(200).json({ success: true, message: 'Alert updated', alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    if (!['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await EmergencyAlert.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveAlerts = async (req, res) => {
  try {
    const { village } = req.query;
    const now = new Date();
    const filter = {
      isActive: true,
      $or: [
        { expiresAt: { $gte: now } },
        { expiresAt: null }
      ]
    };
    if (village) filter.village = new RegExp(village, 'i');

    const alerts = await EmergencyAlert.find(filter)
      .populate('createdBy', 'name phone')
      .sort({ severity: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};