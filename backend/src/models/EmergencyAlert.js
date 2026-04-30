const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['earthquake', 'flood', 'fire', 'landslide', 'cyclone', 'medical', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    village: String,
    district: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  instructions: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  village: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  affectedArea: {
    type: String,
    default: ''
  },
  contactNumber: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);