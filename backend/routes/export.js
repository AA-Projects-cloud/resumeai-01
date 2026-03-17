const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { exportLimiter } = require('../middleware/rateLimit');
const exportController = require('../controllers/exportController');

router.use(requireAuth);
router.use(exportLimiter);

router.post('/pdf', exportController.exportPdf);
router.post('/docx', exportController.exportDocx);
router.post('/txt', exportController.exportTxt);

module.exports = router;
