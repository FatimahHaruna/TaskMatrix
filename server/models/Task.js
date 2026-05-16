const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: String, default: 'me' },
  action: { type: String },
  detail: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const commentSchema = new mongoose.Schema({
  user: { type: String, default: 'me' },
  body: { type: String, required: true },
}, { timestamps: true });

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: '' },
    quadrant: { type: String, enum: ['q1', 'q2', 'q3', 'q4'], required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    labels: [{ type: String, trim: true }],
    dueDate: { type: Date },
    dueTime: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    assignee: { type: String, default: 'me' },
    aiSuggested: { type: Boolean, default: false },
    aiConfidence: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    aiReason: { type: String, default: '' },
    order: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    comments: [commentSchema],
    activity: [activitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
