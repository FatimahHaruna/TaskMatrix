const Task = require('../models/Task');

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ deleted: { $ne: true } }).sort({ quadrant: 1, order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTrash = async (req, res) => {
  try {
    const tasks = await Task.find({ deleted: true }).sort({ deletedAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      activity: [{ user: 'me', action: 'created', detail: 'Task created' }],
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const existing = await Task.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const activityEntry = { user: 'me', action: 'updated', detail: 'Task updated' };
    if (req.body.quadrant && req.body.quadrant !== existing.quadrant) {
      const labels = { q1: 'Do First', q2: 'Schedule', q3: 'Delegate', q4: 'Eliminate' };
      activityEntry.detail = `Moved from ${labels[existing.quadrant]} to ${labels[req.body.quadrant]}`;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, $push: { activity: activityEntry } },
      { new: true, runValidators: true }
    );
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const softDeleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { deleted: true, deletedAt: new Date(), $push: { activity: { user: 'me', action: 'deleted', detail: 'Moved to trash' } } },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task moved to trash', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const restoreTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { deleted: false, deletedAt: null, $push: { activity: { user: 'me', action: 'restored', detail: 'Restored from trash' } } },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const permanentDelete = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleComplete = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    task.activity.push({ user: 'me', action: task.completed ? 'completed' : 'reopened', detail: task.completed ? 'Marked complete' : 'Marked incomplete' });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ message: 'Comment body required' });
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user: 'me', body }, activity: { user: 'me', action: 'commented', detail: body.slice(0, 60) } } },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const reorderTasks = async (req, res) => {
  try {
    const { updates } = req.body; // [{ id, quadrant, order }]
    await Promise.all(
      updates.map(({ id, quadrant, order }) =>
        Task.findByIdAndUpdate(id, { quadrant, order })
      )
    );
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, getTrash, createTask, updateTask, softDeleteTask, restoreTask, permanentDelete, toggleComplete, addComment, reorderTasks };
