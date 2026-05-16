const express = require('express');
const router = express.Router();
const {
  getTasks, getTrash, createTask, updateTask, softDeleteTask,
  restoreTask, permanentDelete, toggleComplete, addComment, reorderTasks,
} = require('../controllers/taskController');

router.get('/', getTasks);
router.get('/trash', getTrash);
router.post('/', createTask);
router.post('/reorder', reorderTasks);
router.put('/:id', updateTask);
router.delete('/:id', softDeleteTask);
router.patch('/:id/restore', restoreTask);
router.delete('/:id/permanent', permanentDelete);
router.patch('/:id/toggle', toggleComplete);
router.post('/:id/comments', addComment);

module.exports = router;
