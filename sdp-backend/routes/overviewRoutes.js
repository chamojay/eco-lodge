const express = require('express');
const router = express.Router();
const { getOverviewData } = require('../controllers/overviewController');

router.get('/', getOverviewData);

module.exports = router;