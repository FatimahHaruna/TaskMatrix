const express = require('express');
const router = express.Router();
const { suggest } = require('../controllers/aiController');

router.post('/suggest', suggest);

module.exports = router;
