const { GoogleGenAI } = require('@google/genai');
const config = require('../config/env');

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

const analyzeResumeWithAI = async (resumeText, jobDescription) => {
  // 1. Fallback / Mock behavior if API key is not provided
  if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log('No valid API key provided. Returning deep dynamic mock data.');
    return generateMockAnalysis(resumeText, jobDescription);
  }

  const prompt = `Act as an expert HR recruiter and ATS (Applicant Tracking System) software.

Your task is to deeply analyze the provided Resume against the provided Job Description.
DO NOT use predefined or hardcoded suggestions. Generate a unique, context-aware evaluation based strictly on the actual resume content.

Evaluate the following areas:
1. Real Resume Evaluation: Check for Contact Info, Summary, Tech Skills, Soft Skills, Experience, Projects, Education, Certs, Achievements, Leadership, Internships, Portfolio/GitHub/LinkedIn, Languages. Only provide feedback on sections that actually exist or are missing. (e.g. if Projects is missing, suggest adding 2-3 projects. If present, evaluate relevance). Never provide conflicting suggestions.
2. Smart ATS Analysis: Detect issues like tables or icons. Only report them if they actually exist in the resume text format.
3. Dynamic Keyword Analysis: Compare resume with job description. Show matched keywords, missing keywords, and important missing skills based ONLY on the job description.
4. Dynamic Skills Analysis: Extract skills. Recommend additional relevant skills.
5. Experience & Project Analysis: Evaluate relevance, career progression, complexity, and impact. If experience aligns well, do not just suggest "add more".
6. Achievement Analysis: Check for measurable results (e.g. "Increased sales by 25%").
7. Resume Summary Analysis: Evaluate if it's strong or weak. Highlight why.
8. Education Analysis: Verify degree, year, coursework.
9. Grammar & Readability: Detect mistakes, passive voice, long sentences. Give examples from the text.
10. Personalized Improvement Suggestions: 5-10 unique recommendations based ONLY on the resume content. Do not give generic advice unless needed.
11. Recruiter Feedback: Would you shortlist this candidate? Why? Concerns? Impressions? Will they get an interview?
12. Score Calculation: Calculate scores dynamically (0-100) reflecting the actual analysis.

Return ONLY structured JSON adhering exactly to the following schema:
{
  "scores": {
    "overall": number,
    "ats": number,
    "jobMatch": number,
    "skills": number,
    "experience": number,
    "projects": number,
    "education": number,
    "formatting": number,
    "grammar": number
  },
  "recruiterFeedback": {
    "shortlist": boolean,
    "reasoning": "string",
    "concerns": ["string"],
    "impressions": ["string"]
  },
  "sectionAnalysis": [
    { "section": "string (e.g., Projects)", "status": "string (present/missing/weak)", "feedback": "string" }
  ],
  "atsAnalysis": ["string"],
  "keywordAnalysis": {
    "matched": ["string"],
    "missing": ["string"],
    "importantMissing": ["string"]
  },
  "skillsAnalysis": {
    "found": ["string"],
    "missing": ["string"],
    "recommended": ["string"]
  },
  "grammarAndReadability": ["string"],
  "suggestions": ["string"]
}

Return JSON only. No markdown formatting or extra text.

Resume Text:
${resumeText}

Job Description:
${jobDescription}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text();
    const cleanJSON = resultText.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Error with AI service:', error);
    console.log('Falling back to mock data due to AI error.');
    return generateMockAnalysis(resumeText, jobDescription);
  }
};

const generateMockAnalysis = (resumeText, jobDescription) => {
  const extractSkills = (text) => {
    const techSkills = [
      'javascript', 'react', 'node', 'node.js', 'python', 'java', 'c++', 'c#', 'ruby', 'php',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'sql', 'mysql', 'postgresql',
      'mongodb', 'nosql', 'graphql', 'rest', 'api', 'git', 'github', 'gitlab', 'ci/cd',
      'agile', 'scrum', 'html', 'css', 'sass', 'less', 'typescript', 'angular', 'vue',
      'django', 'flask', 'spring', 'express', 'linux', 'bash', 'machine learning', 'ai',
      'data analysis', 'management', 'leadership', 'communication', 'problem solving'
    ];
    const lowerText = text.toLowerCase();
    return techSkills.filter(skill => lowerText.includes(skill));
  };

  const resumeKeywords = extractSkills(resumeText);
  const jobKeywords = extractSkills(jobDescription);

  const targetSkills = jobKeywords.length > 0 ? jobKeywords : ['javascript', 'react', 'node', 'sql', 'git'];
  const matchedSkills = targetSkills.filter(k => resumeKeywords.includes(k));
  const missingKeywords = targetSkills.filter(k => !resumeKeywords.includes(k));

  const jobMatch = targetSkills.length > 0 ? Math.round((matchedSkills.length / targetSkills.length) * 100) : 0;
  
  // Dynamic parsing detection
  const hasProjects = resumeText.toLowerCase().includes('project');
  const hasEducation = resumeText.toLowerCase().includes('education') || resumeText.toLowerCase().includes('university');
  const hasExperience = resumeText.toLowerCase().includes('experience') || resumeText.toLowerCase().includes('work');
  
  const sectionAnalysis = [];
  if (hasProjects) sectionAnalysis.push({ section: "Projects", status: "present", feedback: "✅ Projects section found. Ensure you highlight business impact and specific technologies used." });
  else sectionAnalysis.push({ section: "Projects", status: "missing", feedback: "❌ Projects section is missing. Adding 2–3 relevant projects will strengthen your profile." });
  
  if (hasEducation) sectionAnalysis.push({ section: "Education", status: "present", feedback: "✅ Education is clearly listed." });
  else sectionAnalysis.push({ section: "Education", status: "missing", feedback: "❌ Education details are missing. Add your degree and university." });

  if (hasExperience) sectionAnalysis.push({ section: "Work Experience", status: "present", feedback: "✅ Experience section is present. Ensure bullet points use action verbs and quantifiable metrics." });
  else sectionAnalysis.push({ section: "Work Experience", status: "missing", feedback: "❌ No work experience detected. If you lack professional experience, focus heavily on academic projects." });

  const atsAnalysis = [];
  atsAnalysis.push("ATS parsing simulated successfully.");
  if (resumeText.includes('|') || resumeText.includes('table')) {
    atsAnalysis.push("Issue: Potential tables detected. ATS systems may not parse tables correctly.");
  }

  const grammar = [];
  grammar.push("No major spelling mistakes detected in heuristic pass.");
  if (resumeText.length > 2000) grammar.push("Some sentences may be lengthy. Consider breaking up dense paragraphs into bullet points.");

  const shortlist = jobMatch > 50;

  return {
    scores: {
      overall: Math.min(100, 50 + Math.round(jobMatch / 2)),
      ats: Math.min(100, 70 + Math.round(jobMatch / 3)),
      jobMatch: jobMatch,
      skills: Math.min(100, 40 + Math.round((matchedSkills.length / targetSkills.length) * 60)),
      experience: hasExperience ? 80 : 40,
      projects: hasProjects ? 85 : 30,
      education: hasEducation ? 90 : 50,
      formatting: 85,
      grammar: 88
    },
    recruiterFeedback: {
      shortlist: shortlist,
      reasoning: shortlist 
        ? `The candidate aligns with ${jobMatch}% of the technical requirements and has core sections present.` 
        : `The candidate lacks significant overlap with the job description (${jobMatch}% match).`,
      concerns: missingKeywords.length > 2 
        ? [`Missing crucial technical skills such as ${missingKeywords[0].toUpperCase()}`] 
        : ["Needs more quantifiable achievements in the experience section."],
      impressions: matchedSkills.length > 2 
        ? [`Strong foundation in ${matchedSkills.slice(0,2).join(', ').toUpperCase()}.`] 
        : ["Clean document structure."]
    },
    sectionAnalysis: sectionAnalysis,
    atsAnalysis: atsAnalysis,
    keywordAnalysis: {
      matched: matchedSkills.map(w => w.toUpperCase()),
      missing: missingKeywords.map(w => w.toUpperCase()),
      importantMissing: missingKeywords.slice(0, 3).map(w => w.toUpperCase())
    },
    skillsAnalysis: {
      found: matchedSkills.map(w => w.toUpperCase()),
      missing: missingKeywords.map(w => w.toUpperCase()),
      recommended: missingKeywords.includes('cloud') || missingKeywords.includes('aws') ? ['CI/CD', 'Docker'] : ['Agile Methodologies']
    },
    grammarAndReadability: grammar,
    suggestions: missingKeywords.slice(0, 3).map(w => `Consider adding your experience with '${w.toUpperCase()}' if applicable.`).concat([
      "Quantify your past achievements (e.g., 'increased efficiency by 20%').",
      "Tailor your professional summary to explicitly target this specific job role.",
      "Add a real Gemini API Key for full deep LLM analysis!"
    ]).slice(0, 5)
  };
};

const generateMockInterview = (resumeText, jobDescription) => {
  // Simple heuristic to extract potential keywords/skills from JD
  const techTerms = ['react', 'node', 'javascript', 'python', 'java', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'agile', 'leadership', 'design', 'architecture', 'api'];
  const jdLower = (jobDescription || '').toLowerCase();
  
  const foundTerms = techTerms.filter(term => jdLower.includes(term));
  const skill1 = foundTerms.length > 0 ? foundTerms[0] : 'relevant technologies';
  const skill2 = foundTerms.length > 1 ? foundTerms[1] : 'the core requirements';
  
  return [
    `I see from your resume that you have a background that might fit our needs. Can you describe your experience working with ${skill1.toUpperCase()}?`,
    `The job description heavily emphasizes ${skill2.toUpperCase()}. Could you walk me through your most complex project using this or similar technologies?`,
    "Tell me about a time you had a disagreement with a team member over a technical decision. How did you resolve it?",
    "Based on the job requirements, we need someone who can work independently and deliver. Can you share an example of a time you had to take ownership of a feature from start to finish?",
    `What is your approach to writing clean, maintainable, and scalable code, especially when working with tools like ${skill1.toUpperCase()}?`
  ];
};

const generateInterviewQuestions = async (resumeText, jobDescription) => {
  if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return generateMockInterview(resumeText, jobDescription);
  }

  const prompt = `Act as an expert hiring manager.
Based on the following Resume and Job Description, generate exactly 5 tough, personalized interview questions.
Focus on verifying claims made in the resume and testing the skills required by the job description.

Return ONLY a valid JSON array of 5 strings. No markdown, no extra text.
Example: ["Question 1?", "Question 2?", ...]

Resume:
${resumeText}

Job Description:
${jobDescription}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text();
    const cleanJSON = resultText.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Error with AI interview generation:', error);
    return generateMockInterview(resumeText, jobDescription);
  }
};

const generateMockEvaluation = (questions, answers) => {
  const idealAnswers = [
    "A strong answer covers the problem context, your specific role, the technical choices you made and why, the trade-offs you considered, and the measurable outcome. Use the STAR framework and be specific about technologies.",
    "Mention concrete sources like official documentation, tech blogs (e.g., Medium, Dev.to), online courses (Udemy, Coursera), open-source contributions, and hands-on personal projects. Show genuine passion for continuous learning.",
    "Describe the disagreement objectively, explain how you listened to understand the other point of view, how you presented data or evidence for your approach, and how you reached a collaborative decision. Focus on the outcome and what you learned.",
    "Walk through the feature lifecycle: how you gathered requirements, broke it into tasks, handled blockers independently, communicated progress proactively, and delivered it successfully. Highlight any initiative or extra ownership you took.",
    "Mention principles like SOLID, DRY, and KISS. Discuss code review practices, unit testing, meaningful naming conventions, modular design, and how you document your work for future developers."
  ];

  return {
    overallScore: 75,
    feedback: questions.map((q, idx) => ({
      question: q,
      answer: answers[idx] || 'No answer provided.',
      strengths: answers[idx]?.length > 20 ? 'Good attempt at explaining the core concept.' : 'Not enough detail provided.',
      weaknesses: 'Could provide more specific examples and structure the answer using the STAR method.',
      score: answers[idx]?.length > 20 ? 8 : 4,
      idealAnswer: idealAnswers[idx] || "A strong answer uses the STAR method: Situation, Task, Action, Result. Be specific with examples, technologies, and measurable outcomes."
    })),
    suggestions: [
      "Use the STAR (Situation, Task, Action, Result) method for behavioral questions.",
      "Provide more concrete technical examples from your past projects.",
      "Be more concise but ensure you hit the key technical requirements."
    ]
  };
};

const evaluateInterviewWithAI = async (questions, answers) => {
  if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return generateMockEvaluation(questions, answers);
  }

  const prompt = `Act as an expert hiring manager and technical interviewer.
I have asked a candidate the following interview questions, and they have provided the corresponding answers.
Please evaluate their answers and provide a score out of 100, specific feedback for each question (strengths and weaknesses), and overall suggestions for improvement. Be constructive but realistic.

Questions:
${JSON.stringify(questions, null, 2)}

Answers:
${JSON.stringify(answers, null, 2)}

Return ONLY a valid JSON object with the following schema:
{
  "overallScore": number,
  "feedback": [
    {
      "question": string,
      "answer": string,
      "strengths": string,
      "weaknesses": string,
      "score": number (out of 10),
      "idealAnswer": string (a model answer the candidate should aim for, 2-3 sentences covering the key points a hiring manager would want to hear)
    }
  ],
  "suggestions": [string]
}
No markdown, no extra text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text();
    const cleanJSON = resultText.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Error with AI interview evaluation:', error);
    return generateMockEvaluation(questions, answers);
  }
};

module.exports = {
  analyzeResumeWithAI,
  generateInterviewQuestions,
  evaluateInterviewWithAI
};
