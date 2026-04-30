const Asset = require('../models/Asset');

exports.createAsset = async (req, res) => {
  try {
    const { name, category, description, assetCode, purchaseDate, purchaseCost, currentValue, condition, location, village, assignedTo, assignedToName } = req.body;

    if (!name || !category || !description || !location || !village) {
      return res.status(400).json({ success: false, message: 'Please provide required fields' });
    }

    const assetData = {
      name,
      category,
      description,
      assetCode,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      purchaseCost,
      currentValue,
      condition: condition || 'good',
      location,
      village,
      createdBy: req.user.id
    };

    if (assignedTo) {
      assetData.assignedTo = assignedTo;
      assetData.assignedToName = assignedToName || '';
    }

    if (req.file) {
      assetData.image = `/uploads/${req.file.filename}`;
    }

    const asset = await Asset.create(assetData);
    res.status(201).json({ success: true, message: 'Asset created', asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const { village, category, condition, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (village && ['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      filter.village = village;
    } else if (req.user.village) {
      filter.village = req.user.village;
    }
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const assets = await Asset.find(filter)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Asset.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: assets.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      assets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name phone');
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.status(200).json({ success: true, asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    let asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (!['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { name, category, description, assetCode, purchaseDate, purchaseCost, currentValue, condition, location, assignedTo, assignedToName, isActive } = req.body;

    if (name) asset.name = name;
    if (category) asset.category = category;
    if (description) asset.description = description;
    if (assetCode) asset.assetCode = assetCode;
    if (purchaseDate) asset.purchaseDate = new Date(purchaseDate);
    if (purchaseCost !== undefined) asset.purchaseCost = purchaseCost;
    if (currentValue !== undefined) asset.currentValue = currentValue;
    if (condition) asset.condition = condition;
    if (location) asset.location = location;
    if (assignedTo !== undefined) {
      asset.assignedTo = assignedTo;
      asset.assignedToName = assignedToName || '';
    }
    if (isActive !== undefined) asset.isActive = isActive;

    asset = await asset.save();
    res.status(200).json({ success: true, message: 'Asset updated', asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (!['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Asset.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addMaintenance = async (req, res) => {
  try {
    let asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (!['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { description, cost, nextDue } = req.body;
    asset.maintenanceHistory.push({
      description,
      cost,
      nextDue: nextDue ? new Date(nextDue) : null
    });

    asset = await asset.save();
    res.status(200).json({ success: true, message: 'Maintenance record added', asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};