const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { analyzeResume, generateInterview, evaluateInterviewAnswers } = require('../controllers/analyzeController');

router.post('/', upload.single('resume'), analyzeResume);
router.post('/interview', upload.single('resume'), generateInterview);
router.post('/evaluate-interview', evaluateInterviewAnswers); // JSON payload, no file upload needed

module.exports = router;
