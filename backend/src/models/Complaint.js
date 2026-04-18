const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    category: {
      type: String,
      enum: [
        'Road', 'Water', 'Electricity', 'Sanitation', 'Health', 'Education',
        'Drainage', 'Street Light', 'Public Property', 'Pollution',
        'Animal Nuisance', 'Encroachment', 'Government Services', 'Other'
      ],
      required: [true, 'Please select a category'],
    },
    otherDetails: {
      // For 'Other' category — user can provide extra detail
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Please provide location'],
    },
    latitude: { type: Number },
    longitude: { type: Number },
    village: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      default: 'General',
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    assignedTo: {
      type: String,  // worker name / contact (free text for simplicity)
      default: '',
    },
    adminNotes: { type: String, default: '' },
    timeline: [
      {
        status: String,
        notes: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    isEscalated: { type: Boolean, default: false },
    escalatedAt: { type: Date },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
