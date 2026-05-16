const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'tm_dev_secret';
const signToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: '30d' });

// Password strength: 8+ chars, uppercase, number, special char
function validatePassword(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character (!@#$%^&* etc.).';
  return null;
}

const register = async (req, res) => {
  try {
    const { displayName, email, password, timezone } = req.body;
    if (!displayName || !email || !password)
      return res.status(400).json({ message: 'displayName, email and password are required' });

    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ message: pwdError });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ displayName, email, password, timezone });
    res.status(201).json({
      token: signToken(user._id),
      user: { _id: user._id, displayName: user.displayName, email: user.email, avatarInitials: user.avatarInitials, timezone: user.timezone, role: user.role, plan: user.plan, notificationPrefs: user.notificationPrefs, aiPrefs: user.aiPrefs }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    // Check lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Account locked due to too many failed attempts. Try again in ${mins} minute(s).` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      if (attempts >= 5) {
        await User.findByIdAndUpdate(user._id, { loginAttempts: 0, lockUntil: new Date(Date.now() + 15 * 60 * 1000) });
        return res.status(423).json({ message: 'Account locked for 15 minutes after 5 failed attempts.' });
      }
      await User.findByIdAndUpdate(user._id, { loginAttempts: attempts });
      const remaining = 5 - attempts;
      return res.status(401).json({ message: `Invalid email or password. ${remaining} attempt(s) remaining before lockout.` });
    }

    // Success — reset counters without triggering pre-save hook
    await User.findByIdAndUpdate(user._id, { loginAttempts: 0, $unset: { lockUntil: 1 } });

    res.json({
      token: signToken(user._id),
      user: { _id: user._id, displayName: user.displayName, email: user.email, avatarInitials: user.avatarInitials, timezone: user.timezone, role: user.role, plan: user.plan, notificationPrefs: user.notificationPrefs, aiPrefs: user.aiPrefs }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

const updateMe = async (req, res) => {
  try {
    const { displayName, timezone, notificationPrefs, aiPrefs, darkMode } = req.body;
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (timezone !== undefined) updates.timezone = timezone;
    if (notificationPrefs !== undefined) updates.notificationPrefs = notificationPrefs;
    if (aiPrefs !== undefined) updates.aiPrefs = aiPrefs;
    if (darkMode !== undefined) updates.darkMode = darkMode;
    if (updates.displayName) {
      updates.avatarInitials = updates.displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Forgot password — generates token and returns it (in production, email it)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    // Always respond OK to avoid email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // In production: send email with reset link
    // For demo: return the token directly
    res.json({
      message: 'Password reset token generated. In production this would be emailed.',
      resetToken: token, // Remove in production
      resetUrl: `/reset-password?token=${token}`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset password using token
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password required' });

    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ message: pwdError });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({ token: signToken(user._id), message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateMe, forgotPassword, resetPassword };
