const express = require('express');
const router = express.Router();
const { suggest, subtasks, misclassify } = require('../controllers/aiController');

router.post('/suggest', suggest);
router.post('/subtasks', subtasks);
router.post('/misclassify', misclassify);

module.exports = router;
