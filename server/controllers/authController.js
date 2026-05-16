const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'tm_dev_secret';
const signToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: '30d' });

const register = async (req, res) => {
  try {
    const { displayName, email, password, timezone } = req.body;
    if (!displayName || !email || !password)
      return res.status(400).json({ message: 'displayName, email and password are required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ displayName, email, password, timezone });
    res.status(201).json({ token: signToken(user._id), user: { _id: user._id, displayName: user.displayName, email: user.email, avatarInitials: user.avatarInitials, timezone: user.timezone, role: user.role, notificationPrefs: user.notificationPrefs, aiPrefs: user.aiPrefs } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: signToken(user._id), user: { _id: user._id, displayName: user.displayName, email: user.email, avatarInitials: user.avatarInitials, timezone: user.timezone, role: user.role, notificationPrefs: user.notificationPrefs, aiPrefs: user.aiPrefs } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

const updateMe = async (req, res) => {
  try {
    const { displayName, timezone, notificationPrefs, aiPrefs } = req.body;
    const updates = {};
    if (displayName) updates.displayName = displayName;
    if (timezone) updates.timezone = timezone;
    if (notificationPrefs) updates.notificationPrefs = notificationPrefs;
    if (aiPrefs) updates.aiPrefs = aiPrefs;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateMe };
