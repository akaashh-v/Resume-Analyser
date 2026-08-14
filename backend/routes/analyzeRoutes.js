const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { 
  analyzeResume, 
  generateInterview, 
  evaluateInterviewAnswers,
  analyzeLinkedInProfile,
  generateCoverLetter,
  generateCareerPlan,
  evaluateCommunication,
  generateScenario,
  generateAptitudeTest,
  scrapeJob
} = require('../controllers/analyzeController');
const { 
  rewriteResumeWithAI, 
  enhanceBulletWithAI, 
  parseResumeTextWithAI 
} = require('../services/aiService');
const { extractText } = require('../services/resumeParser');

router.post('/', upload.single('resume'), analyzeResume);
router.post('/interview', upload.single('resume'), generateInterview);
router.post('/evaluate-interview', evaluateInterviewAnswers);
router.post('/linkedin', analyzeLinkedInProfile);
router.post('/cover-letter', generateCoverLetter);
router.post('/career-plan', generateCareerPlan);
router.post('/evaluate-communication', evaluateCommunication);
router.post('/generate-scenario', generateScenario);
router.post('/aptitude-test', generateAptitudeTest);
router.post('/scrape-job', scrapeJob);

router.post('/parse-file', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a resume file.' });
    const resumeText = await extractText(req.file.buffer, req.file.originalname);
    const structuredData = await parseResumeTextWithAI(resumeText);
    res.status(200).json(structuredData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rewrite-resume', async (req, res) => {
  try {
    const { resumeText, instructions } = req.body;
    const result = await rewriteResumeWithAI(resumeText, instructions);
    res.status(200).json({ rewrittenText: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/enhance-bullet', async (req, res) => {
  try {
    const { bulletText } = req.body;
    const result = await enhanceBulletWithAI(bulletText);
    res.status(200).json({ enhancedText: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

