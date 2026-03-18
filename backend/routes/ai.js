const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimit');
const aiController = require('../controllers/aiController');

router.use(requireAuth);
router.use(aiLimiter);

router.post('/generate', aiController.generateResume);
router.post('/improve', aiController.improveContent);

module.exports = router;
