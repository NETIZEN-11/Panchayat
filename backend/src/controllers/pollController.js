const Poll = require('../models/Poll');

// @desc    Get all active polls
// @route   GET /api/polls
// @access  Private
exports.getPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ isActive: true })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: polls.length,
      data: polls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create poll (Admin only)
// @route   POST /api/polls
// @access  Private/Admin
exports.createPoll = async (req, res) => {
  try {
    const { question, questionHindi, options, endDate } = req.body;

    const poll = await Poll.create({
      question,
      questionHindi,
      options: options.map(opt => ({
        text: opt.text,
        textHindi: opt.textHindi,
        votes: 0,
        votedBy: []
      })),
      endDate,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: poll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Vote on poll
// @route   POST /api/polls/:id/vote
// @access  Private
exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    if (!poll.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Poll is no longer active'
      });
    }

    // Check if user already voted
    const alreadyVoted = poll.options.some(opt => 
      opt.votedBy.includes(req.user.id)
    );

    if (alreadyVoted) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this poll'
      });
    }

    // Add vote
    poll.options[optionIndex].votes += 1;
    poll.options[optionIndex].votedBy.push(req.user.id);

    await poll.save();

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: poll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
