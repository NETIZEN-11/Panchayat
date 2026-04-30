const Meeting = require('../models/Meeting');
const { sendToVillage } = require('../utils/notifications');

exports.createMeeting = async (req, res) => {
  try {
    const { title, titleHindi, description, descriptionHindi, meetingType, scheduledAt, duration, location, village, agenda, isRecurring, recurringPattern, reminders } = req.body;

    if (!title || !description || !scheduledAt || !location || !village) {
      return res.status(400).json({ success: false, message: 'Please provide required fields' });
    }

    const meetingData = {
      title,
      titleHindi,
      description,
      descriptionHindi,
      meetingType: meetingType || 'gram_sabha',
      scheduledAt: new Date(scheduledAt),
      duration: duration || 120,
      location,
      village,
      district: req.user.district || 'General',
      agenda: agenda || [],
      isRecurring: isRecurring || false,
      recurringPattern,
      reminders,
      createdBy: req.user.id
    };

    const meeting = await Meeting.create(meetingData);

    const meetingDate = new Date(scheduledAt).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    await sendToVillage(
      village,
      `📅 New Meeting: ${title}`,
      `${description}\n\nDate: ${meetingDate}\nTime: ${new Date(scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}\nLocation: ${location}`,
      'meeting',
      req.user.id
    );

    res.status(201).json({ success: true, message: 'Meeting created', meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const { village, meetingType, upcoming, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (village && ['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      filter.village = village;
    } else if (req.user.village) {
      filter.village = req.user.village;
    }
    if (meetingType) filter.meetingType = meetingType;
    if (upcoming === 'true') {
      filter.scheduledAt = { $gte: new Date() };
      filter.isCompleted = false;
    }

    const skip = (page - 1) * limit;
    const meetings = await Meeting.find(filter)
      .populate('createdBy', 'name phone')
      .sort({ scheduledAt: upcoming === 'true' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Meeting.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: meetings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      meetings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('createdBy', 'name phone')
      .populate('attendees.userId', 'name phone');
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    res.status(200).json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    let meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    if (meeting.createdBy.toString() !== req.user.id && !['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, titleHindi, description, descriptionHindi, meetingType, scheduledAt, duration, location, agenda, isActive, isCompleted, minutes } = req.body;

    if (title) meeting.title = title;
    if (titleHindi) meeting.titleHindi = titleHindi;
    if (description) meeting.description = description;
    if (descriptionHindi) meeting.descriptionHindi = descriptionHindi;
    if (meetingType) meeting.meetingType = meetingType;
    if (scheduledAt) meeting.scheduledAt = new Date(scheduledAt);
    if (duration) meeting.duration = duration;
    if (location) meeting.location = location;
    if (agenda) meeting.agenda = agenda;
    if (isActive !== undefined) meeting.isActive = isActive;
    if (isCompleted !== undefined) meeting.isCompleted = isCompleted;
    if (minutes) meeting.minutes = minutes;

    meeting = await meeting.save();
    res.status(200).json({ success: true, message: 'Meeting updated', meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    if (meeting.createdBy.toString() !== req.user.id && !['sarpanch', 'govt', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Meeting.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { userId, name, role, present } = req.body;
    let meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    const attendeeIndex = meeting.attendees.findIndex(a => a.userId?.toString() === userId);
    if (attendeeIndex >= 0) {
      meeting.attendees[attendeeIndex].present = present;
    } else {
      meeting.attendees.push({ userId, name, role, present });
    }

    meeting = await meeting.save();
    res.status(200).json({ success: true, message: 'Attendance marked', meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};