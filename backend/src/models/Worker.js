const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  department: {
    type: String,
    enum: ['Road', 'Water', 'Electricity', 'Sanitation', 'Health', 'Education', 'Drainage', 'Public Works', 'Other'],
    required: true,
  },
  village: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);
