const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Search user by email (for team invite)
router.get('/search', protect, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email query required' });
    const User = require('../models/User');
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'No TaskMatrix account found for this email.' });
    res.json({ _id: user._id, displayName: user.displayName, email: user.email, avatarInitials: user.avatarInitials });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
