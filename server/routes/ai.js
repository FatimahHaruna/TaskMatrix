const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { suggest, subtasks, misclassify } = require('../controllers/aiController');

router.use(protect);

router.post('/suggest', suggest);
router.post('/subtasks', subtasks);
router.post('/misclassify', misclassify);

module.exports = router;
