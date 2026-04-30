const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  titleHindi: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  descriptionHindi: {
    type: String
  },
  meetingType: {
    type: String,
    enum: ['gram_sabha', 'panchayat', 'committee', 'emergency', 'other'],
    default: 'gram_sabha'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 120 // minutes
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
  agenda: [{
    item: String,
    itemHindi: String,
    order: Number
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly'],
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    hoursBefore: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  minutes: {
    type: String,
    default: ''
  },
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    role: String,
    present: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meeting', meetingSchema);