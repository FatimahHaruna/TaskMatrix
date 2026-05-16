const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, select: false },
    timezone: { type: String, default: 'UTC' },
    avatarInitials: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'editor' },
    notificationPrefs: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
    },
    aiPrefs: {
      autoSuggestQuadrant: { type: Boolean, default: true },
      suggestTitleImprovements: { type: Boolean, default: true },
      suggestSubtasks: { type: Boolean, default: false },
    },
    googleId: { type: String },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    darkMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.avatarInitials && this.displayName) {
    this.avatarInitials = this.displayName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
