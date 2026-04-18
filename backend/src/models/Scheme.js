const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide scheme name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
    },
    eligibility: {
      type: String,
      required: [true, 'Please provide eligibility criteria'],
    },
    benefits: {
      type: String,
      required: [true, 'Please provide benefits'],
    },
    applicationDeadline: {
      type: Date,
    },
    category: {
      type: String,
      enum: ['Agriculture', 'Education', 'Health', 'Social', 'Infrastructure', 'Other'],
      required: true,
    },
    image: {
      type: String,
    },
    contactPerson: {
      type: String,
    },
    contactPhone: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scheme', schemeSchema);
