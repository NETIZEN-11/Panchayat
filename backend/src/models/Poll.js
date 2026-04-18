const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  questionHindi: {
    type: String
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    textHindi: String,
    votes: {
      type: Number,
      default: 0
    },
    votedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  endDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Poll', pollSchema);
