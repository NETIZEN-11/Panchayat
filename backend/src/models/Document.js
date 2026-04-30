const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    enum: ['aadhaar', 'pan', 'voter_id', 'ration_card', 'birth_certificate', 'death_certificate', 'income_certificate', 'caste_certificate', 'domicile', 'other'],
    required: true
  },
  documentNumber: {
    type: String,
    required: true
  },
  documentImage: {
    type: String,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  village: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);