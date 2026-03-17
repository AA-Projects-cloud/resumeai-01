const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.use(requireAuth);

router.get('/', analyticsController.getAnalytics);

module.exports = router;
