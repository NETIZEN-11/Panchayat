const mongoose = require('mongoose');

const directorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['doctor', 'teacher', 'shop', 'worker', 'electrician', 'plumber', 'other']
  },
  phone: {
    type: String,
    required: true
  },
  alternatePhone: String,
  address: String,
  village: String,
  specialization: String, // For doctors, teachers
  shopType: String, // For shops
  workType: String, // For workers
  availability: String,
  image: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

directorySchema.index({ category: 1, village: 1 });

module.exports = mongoose.model('Directory', directorySchema);
