const Task = require('../models/Task');

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id, deleted: { $ne: true } }).sort({ quadrant: 1, order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTrash = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id, deleted: true }).sort({ deletedAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      owner: req.user._id,
      activity: [{ user: req.user.displayName, action: 'created', detail: 'Task created' }],
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const existing = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const activityEntry = { user: req.user.displayName, action: 'updated', detail: 'Task updated' };
    if (req.body.quadrant && req.body.quadrant !== existing.quadrant) {
      const labels = { q1: 'Do First', q2: 'Schedule', q3: 'Delegate', q4: 'Eliminate' };
      activityEntry.detail = `Moved from ${labels[existing.quadrant]} to ${labels[req.body.quadrant]}`;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
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
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { deleted: true, deletedAt: new Date(), $push: { activity: { user: req.user.displayName, action: 'deleted', detail: 'Moved to trash' } } },
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
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { deleted: false, deletedAt: null, $push: { activity: { user: req.user.displayName, action: 'restored', detail: 'Restored from trash' } } },
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
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleComplete = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    task.activity.push({ user: req.user.displayName, action: task.completed ? 'completed' : 'reopened', detail: task.completed ? 'Marked complete' : 'Marked incomplete' });
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
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $push: { comments: { user: req.user.displayName, body }, activity: { user: req.user.displayName, action: 'commented', detail: body.slice(0, 60) } } },
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
        Task.findOneAndUpdate({ _id: id, owner: req.user._id }, { quadrant, order })
      )
    );
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, getTrash, createTask, updateTask, softDeleteTask, restoreTask, permanentDelete, toggleComplete, addComment, reorderTasks };
