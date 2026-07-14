const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role, village, district) => {
  return jwt.sign({ id, role, village, district }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, village, district, state, role } = req.body;

    if (!name || !email || !phone || !password || !village) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Allow citizen and sarpanch self-registration only.
    // Govt accounts must be created by admin or directly in DB.
    const allowedRoles = ['citizen', 'sarpanch', 'user'];
    const assignedRole = allowedRoles.includes(role) ? role : 'citizen';

    user = await User.create({
      name,
      email,
      phone,
      password,
      village,
      district: district || 'General',
      state: state || 'India',
      role: assignedRole,
    });

    const token = generateToken(user._id, user.role, user.village, user.district);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
        district: user.district,
        state: user.state,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role, user.village, user.district);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
        district: user.district,
        state: user.state,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
        district: user.district,
        state: user.state,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, village, district } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (village) user.village = village;
    if (district) user.district = district;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
        district: user.district,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ success: false, message: 'FCM token is required' });

    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    res.status(200).json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
