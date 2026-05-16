const express = require('express');
const router = express.Router();
const { suggest, subtasks } = require('../controllers/aiController');

router.post('/suggest', suggest);
router.post('/subtasks', subtasks);

module.exports = router;
