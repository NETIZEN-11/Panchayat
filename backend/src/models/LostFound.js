const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  category: {
    type: String,
    enum: ['person', 'animal', 'document', 'vehicle', 'electronics', 'jewelry', 'clothing', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  district: {
    type: String,
    default: 'General'
  },
  dateLostFound: {
    type: Date,
    required: true
  },
  contactName: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['open', 'claimed', 'closed'],
    default: 'open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claimedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String,
    default: ''
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

module.exports = mongoose.model('LostFound', lostFoundSchema);