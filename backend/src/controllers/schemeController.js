const Scheme = require('../models/Scheme');

exports.createScheme = async (req, res, next) => {
  try {
    const { name, description, eligibility, benefits, applicationDeadline, category, contactPerson, contactPhone } =
      req.body;

    if (!name || !description || !eligibility || !benefits || !category) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const schemeData = {
      name,
      description,
      eligibility,
      benefits,
      applicationDeadline,
      category,
      contactPerson,
      contactPhone,
      createdBy: req.user.id,
    };

    if (req.file) {
      schemeData.image = `/uploads/${req.file.filename}`;
    }

    const scheme = await Scheme.create(schemeData);

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      scheme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSchemes = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    const schemes = await Scheme.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Scheme.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: schemes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      schemes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSchemeById = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id).populate('createdBy', 'name email');

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    res.status(200).json({
      success: true,
      scheme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateScheme = async (req, res, next) => {
  try {
    let scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    // Only creator or admin can update
    if (scheme.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this scheme' });
    }

    const { name, description, eligibility, benefits, applicationDeadline, category, contactPerson, contactPhone } =
      req.body;

    if (name) scheme.name = name;
    if (description) scheme.description = description;
    if (eligibility) scheme.eligibility = eligibility;
    if (benefits) scheme.benefits = benefits;
    if (applicationDeadline) scheme.applicationDeadline = applicationDeadline;
    if (category) scheme.category = category;
    if (contactPerson) scheme.contactPerson = contactPerson;
    if (contactPhone) scheme.contactPhone = contactPhone;

    if (req.file) {
      scheme.image = `/uploads/${req.file.filename}`;
    }

    scheme = await scheme.save();

    res.status(200).json({
      success: true,
      message: 'Scheme updated successfully',
      scheme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    // Only creator or admin can delete
    if (scheme.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this scheme' });
    }

    await Scheme.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Scheme deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
