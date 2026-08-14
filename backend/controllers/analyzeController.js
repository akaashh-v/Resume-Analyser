const { extractText } = require('../services/resumeParser');
const { analyzeResumeWithAI, generateInterviewQuestions, evaluateInterviewWithAI, parseResumeTextWithAI, analyzeLinkedInWithAI, generateCoverLetterWithAI, generateCareerPlanWithAI, evaluateCommunicationResponseWithAI, generateCommunicationScenarioWithAI, generateAptitudeTestWithAI } = require('../services/aiService');
const { scrapeJobUrl } = require('../services/scraperService');

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume file (.pdf or .docx)' });
    }
    
    if (!req.body.jobDescription) {
      return res.status(400).json({ error: 'Please provide a job description' });
    }

    const { jobDescription } = req.body;
    
    // 1. Extract resume text
    const resumeText = await extractText(req.file.buffer, req.file.originalname);
    console.log("=== RAW RESUME TEXT EXTRACTED ===");
    console.log(resumeText);
    console.log("=================================");

    // 2. Send to AI for Analysis
    const analysisResult = await analyzeResumeWithAI(resumeText, jobDescription);

    // 3. Use AI to structure the resume data for templates
    const structuredData = await parseResumeTextWithAI(resumeText);
    console.log("=== PARSED STRUCTURED DATA ===");
    console.log(JSON.stringify(structuredData, null, 2));
    console.log("===============================");

    // 4. Return JSON including the raw resumeText and structuredData for the builder
    res.status(200).json({ ...analysisResult, resumeText, structuredData });

  } catch (error) {
    console.error('Error in analyzeController:', error);
    res.status(500).json({ error: error.message || 'An error occurred while analyzing the resume' });
  }
};

const generateInterview = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume file (.pdf or .docx)' });
    }
    if (!req.body.jobDescription) {
      return res.status(400).json({ error: 'Please provide a job description' });
    }

    const { jobDescription } = req.body;
    const resumeText = await extractText(req.file.buffer, req.file.originalname);
    
    const questions = await generateInterviewQuestions(resumeText, jobDescription);
    res.status(200).json({ questions });

  } catch (error) {
    console.error('Error in generateInterview:', error);
    res.status(500).json({ error: error.message || 'An error occurred generating interview questions' });
  }
};

const evaluateInterviewAnswers = async (req, res) => {
  try {
    const { questions, answers } = req.body;
    
    if (!questions || !answers) {
      return res.status(400).json({ error: 'Questions and answers must be provided.' });
    }

    // Since the frontend is sending JSON in body, not form-data for this specific one, 
    // we assume express.json() is configured in server.js.
    // If we send it via form-data, we need to parse it. Let's assume standard JSON.
    const parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
    const parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;

    const evaluation = await evaluateInterviewWithAI(parsedQuestions, parsedAnswers);
    res.status(200).json(evaluation);

  } catch (error) {
    console.error('Error in evaluateInterviewAnswers:', error);
    res.status(500).json({ error: error.message || 'An error occurred evaluating the interview' });
  }
};

const analyzeLinkedInProfile = async (req, res) => {
  try {
    const { content, focus } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Profile content is required.' });
    }

    const analysis = await analyzeLinkedInWithAI(content, focus);
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error in analyzeLinkedInProfile:', error);
    res.status(500).json({ error: error.message || 'An error occurred analyzing the LinkedIn profile' });
  }
};

const generateCoverLetter = async (req, res) => {
  try {
    const { resumeContent, jobDescription } = req.body;
    if (!resumeContent || !jobDescription) {
      return res.status(400).json({ error: 'Resume content and job description are required.' });
    }

    const coverLetter = await generateCoverLetterWithAI(resumeContent, jobDescription);
    res.status(200).json({ coverLetter });
  } catch (error) {
    console.error('Error in generateCoverLetter:', error);
    res.status(500).json({ error: error.message || 'An error occurred generating the cover letter' });
  }
};

const generateCareerPlan = async (req, res) => {
  try {
    const { currentRole, targetRole, timeframe, extraContext } = req.body;
    if (!currentRole || !targetRole || !timeframe) {
      return res.status(400).json({ error: 'Current role, target role, and timeframe are required.' });
    }

    const plan = await generateCareerPlanWithAI(currentRole, targetRole, timeframe, extraContext);
    res.status(200).json({ plan });
  } catch (error) {
    console.error('Error in generateCareerPlan:', error);
    res.status(500).json({ error: error.message || 'An error occurred generating the career plan' });
  }
};

const evaluateCommunication = async (req, res) => {
  try {
    const { careerPlan, userResponse } = req.body;
    if (!careerPlan || !userResponse) {
      return res.status(400).json({ error: 'Scenario and user response are required.' });
    }

    const feedback = await evaluateCommunicationResponseWithAI(careerPlan, userResponse);
    res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error in evaluateCommunication:', error);
    res.status(500).json({ error: error.message || 'An error occurred evaluating communication' });
  }
};

const generateScenario = async (req, res) => {
  try {
    const { englishLevel, topic } = req.body;
    if (!englishLevel || !topic) {
      return res.status(400).json({ error: 'English Level and Topic are required.' });
    }

    const scenario = await generateCommunicationScenarioWithAI(englishLevel, topic);
    res.status(200).json({ scenario });
  } catch (error) {
    console.error('Error in generateScenario:', error);
    res.status(500).json({ error: error.message || 'An error occurred generating scenario' });
  }
};

const generateAptitudeTest = async (req, res) => {
  try {
    const { jobRole, difficulty } = req.body;
    if (!jobRole || !difficulty) {
      return res.status(400).json({ error: 'Job Role and Difficulty are required.' });
    }

    const test = await generateAptitudeTestWithAI(jobRole, difficulty);
    res.status(200).json({ test });
  } catch (error) {
    console.error('Error in generateAptitudeTest:', error);
    res.status(500).json({ error: error.message || 'An error occurred generating aptitude test' });
  }
};

const scrapeJob = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Job URL is required.' });
    }

    const data = await scrapeJobUrl(url);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in scrapeJob:', error);
    res.status(500).json({ error: error.message || 'An error occurred scraping the job URL.' });
  }
};

module.exports = {
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
};
