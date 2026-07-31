const { extractText } = require('../services/resumeParser');
const { analyzeResumeWithAI, generateInterviewQuestions, evaluateInterviewWithAI } = require('../services/aiService');

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

    // 2. Send to AI
    const analysisResult = await analyzeResumeWithAI(resumeText, jobDescription);

    // 3. Return JSON
    res.status(200).json(analysisResult);

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

module.exports = {
  analyzeResume,
  generateInterview,
  evaluateInterviewAnswers
};
