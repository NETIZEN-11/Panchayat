const Document = require('../models/Document');
const User = require('../models/User');
const { sendNotification } = require('../utils/notifications');

exports.uploadDocument = async (req, res) => {
  try {
    const { documentType, documentNumber, remarks } = req.body;

    if (!documentType || !documentNumber) {
      return res.status(400).json({ success: false, message: 'Please provide document type and number' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload document image' });
    }

    const user = await User.findById(req.user.id);

    const docData = {
      userId: req.user.id,
      documentType,
      documentNumber,
      documentImage: `/uploads/${req.file.filename}`,
      verificationStatus: 'pending',
      village: req.user.village || user?.village || 'Unknown',
      remarks: remarks || ''
    };

    const document = await Document.create(docData);
    res.status(201).json({ success: true, message: 'Document uploaded successfully', document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: documents.length, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { village, documentType, verificationStatus, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (village && ['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      filter.village = new RegExp(village, 'i');
    } else if (req.user.village) {
      filter.village = req.user.village;
    }
    if (documentType) filter.documentType = documentType;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    const skip = (page - 1) * limit;
    const documents = await Document.find(filter)
      .populate('userId', 'name email phone village')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: documents.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      documents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('userId', 'name email phone village')
      .populate('verifiedBy', 'name');
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    res.status(200).json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyDocument = async (req, res) => {
  try {
    if (!['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    const { verificationStatus, rejectionReason, remarks } = req.body;

    document.verificationStatus = verificationStatus;
    document.verifiedBy = req.user.id;
    document.verifiedAt = new Date();
    if (rejectionReason) document.rejectionReason = rejectionReason;
    if (remarks) document.remarks = remarks;

    document = await document.save();

    await sendNotification(
      document.userId,
      'Document Verification Update',
      `Your ${document.documentType} document has been ${verificationStatus}.`,
      'document',
      document._id
    );

    res.status(200).json({ success: true, message: 'Document verified', document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    if (document.userId.toString() !== req.user.id && !['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: false, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};