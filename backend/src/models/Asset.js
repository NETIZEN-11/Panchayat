const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['vehicle', 'equipment', 'furniture', 'electronics', 'office', 'agriculture', 'construction', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assetCode: {
    type: String,
    unique: true
  },
  purchaseDate: {
    type: Date
  },
  purchaseCost: {
    type: Number
  },
  currentValue: {
    type: Number
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'scrap'],
    default: 'good'
  },
  location: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToName: {
    type: String,
    default: ''
  },
  image: {
    type: String
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    description: String,
    cost: Number,
    nextDue: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

module.exports = mongoose.model('Asset', assetSchema);