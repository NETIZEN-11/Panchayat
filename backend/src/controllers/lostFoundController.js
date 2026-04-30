const LostFound = require('../models/LostFound');
const { sendToVillage } = require('../utils/notifications');

exports.createEntry = async (req, res) => {
  try {
    const { type, category, title, description, location, dateLostFound, contactName, contactPhone } = req.body;

    if (!type || !category || !title || !description || !location || !dateLostFound || !contactName || !contactPhone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const user = await User.findById(req.user.id);
    const entryData = {
      type,
      category,
      title,
      description,
      location,
      village: req.user.village || user?.village || 'Unknown',
      district: req.user.district || user?.district || 'General',
      dateLostFound: new Date(dateLostFound),
      contactName,
      contactPhone,
      postedBy: req.user.id
    };

    if (req.files && req.files.length > 0) {
      entryData.images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.file) {
      entryData.images = [`/uploads/${req.file.filename}`];
    }

    const entry = await LostFound.create(entryData);

    const label = type === 'lost' ? 'Lost Item' : 'Found Item';
    await sendToVillage(
      entryData.village,
      `${label}: ${title}`,
      `${description}\n\nLocation: ${location}\nContact: ${contactName} (${contactPhone})`,
      'lostfound',
      req.user.id
    );

    res.status(201).json({ success: true, message: 'Entry posted successfully', entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEntries = async (req, res) => {
  try {
    const { village, type, category, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (village) filter.village = new RegExp(village, 'i');
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const entries = await LostFound.find(filter)
      .populate('postedBy', 'name phone')
      .populate('claimedBy', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LostFound.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: entries.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      entries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEntryById = async (req, res) => {
  try {
    const entry = await LostFound.findById(req.params.id)
      .populate('postedBy', 'name phone village')
      .populate('claimedBy', 'name phone');
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.status(200).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    let entry = await LostFound.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    if (entry.postedBy.toString() !== req.user.id && !['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, location, contactName, contactPhone, status, resolutionNotes } = req.body;

    if (title) entry.title = title;
    if (description) entry.description = description;
    if (location) entry.location = location;
    if (contactName) entry.contactName = contactName;
    if (contactPhone) entry.contactPhone = contactPhone;
    if (status) entry.status = status;
    if (resolutionNotes) entry.resolutionNotes = resolutionNotes;

    if (status === 'claimed') {
      entry.claimedBy = req.user.id;
      entry.claimedAt = new Date();
    }

    entry = await entry.save();
    res.status(200).json({ success: true, message: 'Entry updated', entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await LostFound.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    if (entry.postedBy.toString() !== req.user.id && !['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await LostFound.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.claimEntry = async (req, res) => {
  try {
    let entry = await LostFound.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    if (entry.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Entry is not open for claims' });
    }

    entry.status = 'claimed';
    entry.claimedBy = req.user.id;
    entry.claimedAt = new Date();
    entry = await entry.save();

    res.status(200).json({ success: true, message: 'Entry claimed successfully', entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};