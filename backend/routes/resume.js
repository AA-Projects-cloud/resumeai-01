const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const resumeController = require('../controllers/resumeController');

// All resume routes require authentication
router.use(requireAuth);

router.get('/list', resumeController.listResumes);
router.post('/create', resumeController.createResume);
router.get('/:id', resumeController.getResume);
router.put('/update/:id', resumeController.updateResume);
router.delete('/delete/:id', resumeController.deleteResume);

module.exports = router;
