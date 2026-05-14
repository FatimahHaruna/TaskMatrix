const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: '' },
    quadrant: {
      type: String,
      enum: ['q1', 'q2', 'q3', 'q4'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    labels: [{ type: String, trim: true }],
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    assignee: { type: String, default: 'me' },
    aiSuggested: { type: Boolean, default: false },
    aiConfidence: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    aiReason: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
