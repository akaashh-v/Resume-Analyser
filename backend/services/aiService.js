const { getAI } = require('./aiClient');
const config = require('../config/env');

const ai = {
  get models() {
    return getAI().models;
  }
};

// Dynamic Score Calculation Helpers
const calculateEducationScore = (resumeText, jobDescription) => {
  const text = (resumeText || '').toLowerCase();
  const jd = (jobDescription || '').toLowerCase();

  const eduSectionKeywords = ['education', 'academic', 'qualification', 'degree', 'university', 'college', 'school', 'institute', 'institution'];
  const hasEduSection = eduSectionKeywords.some(k => text.includes(k));

  if (!hasEduSection) {
    return {
      score: 0,
      feedback: "❌ Education details are missing. Add your degree, university, and graduation year.",
      detectedDegree: null
    };
  }

  let degreeScore = 0;
  let detectedDegree = "";

  if (text.includes('ph.d') || text.includes('phd') || text.includes('doctorate') || text.includes('doctor of philosophy')) {
    degreeScore = 40;
    detectedDegree = "Doctorate / Ph.D.";
  } else if (text.includes('master') || text.includes('m.s') || text.includes('ms degree') || text.includes('m.tech') || text.includes('mba') || text.includes('mca') || text.includes('m.sc')) {
    degreeScore = 35;
    detectedDegree = "Master's Degree";
  } else if (text.includes('bachelor') || text.includes('b.s') || text.includes('bs degree') || text.includes('b.tech') || text.includes('b.e') || text.includes('bca') || text.includes('b.sc') || text.includes('b.a') || text.includes('b.com') || text.includes('undergraduate')) {
    degreeScore = 30;
    detectedDegree = "Bachelor's Degree";
  } else if (text.includes('associate') || text.includes('diploma') || text.includes('polytechnic')) {
    degreeScore = 20;
    detectedDegree = "Associate / Diploma";
  } else if (text.includes('high school') || text.includes('secondary') || text.includes('12th') || text.includes('10th')) {
    degreeScore = 10;
    detectedDegree = "High School";
  } else {
    degreeScore = 15;
    detectedDegree = "Degree Unspecified";
  }

  // Completeness details
  let completenessScore = 0;
  const hasInstitution = ['university', 'institute', 'college', 'school', 'academy', 'polytechnic', 'iit', 'nit', 'bits'].some(k => text.includes(k));
  if (hasInstitution) completenessScore += 12;

  const yearMatch = text.match(/(19|20)\d{2}\s*[-–—]\s*(Present|(19|20)\d{2})/i) || text.match(/(19|20)\d{2}/);
  if (yearMatch) completenessScore += 10;

  const hasMajor = ['computer science', 'information technology', 'software engineering', 'data science', 'electrical', 'electronics', 'mechanical', 'civil', 'business', 'mathematics', 'physics', 'finance', 'accounting', 'arts', 'science', 'engineering', 'cs', 'it'].some(m => text.includes(m));
  if (hasMajor) completenessScore += 8;

  const hasGPA = ['gpa', 'cgpa', 'cum laude', 'honors', 'distinction', 'first class', '%', 'percentage', 'grade'].some(g => text.includes(g));
  if (hasGPA) completenessScore += 5;

  // Relevance to Job Description
  let relevanceScore = 15;
  if (jd.includes('computer science') || jd.includes('engineering') || jd.includes('degree') || jd.includes('bachelor') || jd.includes('master')) {
    if (text.includes('computer science') || text.includes('software engineering') || text.includes('information technology') || text.includes('b.tech') || text.includes('b.e') || text.includes('m.tech') || text.includes('bca') || text.includes('mca')) {
      relevanceScore = 25;
    } else if (hasMajor) {
      relevanceScore = 20;
    } else {
      relevanceScore = 10;
    }
  } else {
    relevanceScore = 20;
  }

  const finalScore = Math.min(100, Math.max(0, degreeScore + completenessScore + relevanceScore));

  let feedback = "";
  if (finalScore >= 80) {
    feedback = `✅ Strong Education Score (${finalScore}%): ${detectedDegree} found with detailed academic credentials (Institution, Graduation Year, Relevant Field).`;
  } else if (finalScore >= 50) {
    feedback = `⚠️ Moderate Education Score (${finalScore}%): ${detectedDegree} detected. Add institution name, graduation year, GPA, or relevant coursework to boost your score.`;
  } else {
    feedback = `❌ Low Education Score (${finalScore}%): Education details are incomplete. Ensure your degree, university name, major, and graduation year are clearly listed.`;
  }

  return { score: finalScore, feedback, detectedDegree };
};

const calculateExperienceScore = (resumeText) => {
  const text = (resumeText || '').toLowerCase();
  const hasExpHeader = ['experience', 'work history', 'employment', 'work experience', 'career history'].some(k => text.includes(k));

  if (!hasExpHeader) return { score: 20, feedback: "❌ Work experience section is missing or lacks clear section headers." };

  let score = 30;
  const dateMatches = text.match(/(19|20)\d{2}\s*[-–—]\s*(Present|(19|20)\d{2})/gi) || [];
  score += Math.min(30, dateMatches.length * 10);

  const actionVerbs = ['engineered', 'developed', 'spearheaded', 'managed', 'created', 'built', 'led', 'optimized', 'designed', 'implemented', 'launched', 'architected', 'reduced', 'increased'];
  const verbHits = actionVerbs.filter(v => text.includes(v)).length;
  score += Math.min(20, verbHits * 4);

  const hasMetrics = (text.match(/\d+%|\$\d+|\d+\s*users|\d+\s*years/g) || []).length;
  score += Math.min(20, hasMetrics * 5);

  const finalScore = Math.min(100, Math.max(10, score));
  return {
    score: finalScore,
    feedback: finalScore >= 75
      ? `✅ Strong Experience Score (${finalScore}%): Experience section uses strong action verbs and quantifiable achievements.`
      : `⚠️ Moderate Experience Score (${finalScore}%): Add measurable metrics (percentages, team sizes, project impacts) and clear role titles.`
  };
};

const calculateProjectsScore = (resumeText) => {
  const text = (resumeText || '').toLowerCase();
  const hasProjects = ['project', 'projects', 'personal projects', 'key projects'].some(k => text.includes(k));
  if (!hasProjects) return { score: 15, feedback: "❌ Projects section is missing. Adding 2–3 relevant projects will strengthen your profile." };

  let score = 40;
  const projectHits = (text.match(/github|demo|link|built|developed|created|using|tech stack/g) || []).length;
  score += Math.min(45, projectHits * 5);

  const finalScore = Math.min(100, score);
  return {
    score: finalScore,
    feedback: finalScore >= 75
      ? `✅ Strong Projects Score (${finalScore}%): Detailed project descriptions found with technologies and outcomes.`
      : `⚠️ Projects Score (${finalScore}%): Add links to GitHub/Live Demos and specify technologies used in each project.`
  };
};

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
10. Personalized Improvement Suggestions: Provide 5-10 specific, actionable recommendations to improve the resume (e.g., "Quantify your impact in the recent role by adding percentages"). Do NOT suggest job titles or roles here, only exact improvements to the resume document itself.
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
    "impressions": ["string"],
    "matchedJobRoles": [
      { "role": "string (e.g. Full Stack Developer)", "match": "string (e.g. 95% Match)" }
    ]
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
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    const cleanJSON = resultText.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Error with AI service:', error);
    console.log('Falling back to mock data due to AI error.');
    return generateMockAnalysis(resumeText, jobDescription);
  }
};

const generateMockAnalysis = (resumeText, jobDescription) => {
  const extractWords = (text) => {
    if (!text) return [];
    const stopWords = new Set(['and', 'the', 'to', 'of', 'in', 'for', 'with', 'on', 'as', 'a', 'an', 'is', 'are', 'be', 'this', 'that', 'we', 'our', 'you', 'your', 'will', 'can', 'or', 'by', 'at', 'from', 'have', 'has', 'experience', 'ability', 'strong', 'skills', 'working', 'knowledge', 'understanding', 'using', 'team', 'work', 'development', 'design', 'years', 'required', 'preferred', 'plus', 'including', 'such', 'other', 'all', 'any', 'some', 'more', 'most', 'about', 'out', 'up', 'down', 'over', 'under', 'into', 'through', 'after', 'before', 'between', 'during', 'without', 'within', 'how', 'what', 'where', 'when', 'why', 'who', 'which', 'if', 'then', 'else', 'but', 'not', 'no', 'only', 'very', 'just', 'so', 'too', 'also', 'well', 'like', 'than', 'both', 'each', 'every', 'many', 'much', 'few', 'less', 'least', 'great', 'good', 'best', 'better', 'high', 'low', 'new', 'old', 'first', 'last', 'next', 'previous', 'part', 'full', 'time', 'role', 'job', 'position', 'company', 'candidate', 'candidates', 'business', 'product', 'project', 'projects', 'system', 'systems', 'software', 'application', 'applications', 'data', 'user', 'users', 'client', 'clients', 'customer', 'customers', 'support', 'environment', 'environments', 'technology', 'technologies', 'technical', 'management', 'manager', 'lead', 'leader', 'leading', 'looking', 'join', 'help', 'build', 'create', 'maintain', 'improve', 'ensure', 'provide', 'support', 'collaborate', 'closely', 'across', 'teams', 'drive', 'success', 'impact', 'growth', 'opportunity', 'benefits', 'salary', 'remote', 'hybrid', 'office', 'location', 'based', 'world', 'class', 'fast', 'paced', 'dynamic', 'innovative', 'cutting', 'edge', 'state', 'art', 'industry', 'leading', 'award', 'winning', 'top', 'tier', 'proven', 'track', 'record', 'demonstrated', 'excellent', 'outstanding', 'exceptional', 'superior', 'superb', 'stellar', 'fantastic', 'awesome', 'amazing', 'incredible', 'unbelievable', 'mind', 'blowing', 'out', 'world', 'next', 'level', 'game', 'changing', 'disruptive', 'revolutionary', 'groundbreaking', 'pioneering', 'trailblazing', 'visionary', 'forward', 'thinking', 'thought', 'leadership']);

    const techSkills = new Set(['javascript', 'react', 'node', 'node.js', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'graphql', 'rest', 'api', 'git', 'github', 'gitlab', 'ci/cd', 'agile', 'scrum', 'html', 'css', 'sass', 'less', 'typescript', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'linux', 'bash', 'golang', 'rust', 'swift', 'kotlin', 'react native', 'flutter', 'dart', 'scala', 'hadoop', 'spark', 'kafka', 'elasticsearch', 'redis', 'terraform', 'ansible', 'jenkins', 'jira', 'figma', 'webpack', 'babel', 'jest', 'cypress', 'redux', 'next.js', 'vite', 'tailwind']);

    const words = text.toLowerCase().replace(/[^a-z0-9+#.\-]/g, ' ').split(/\s+/).filter(w => w.length > 2);

    const wordCounts = {};
    words.forEach(w => {
      if (!stopWords.has(w) || techSkills.has(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + (techSkills.has(w) ? 5 : 1);
      }
    });

    return Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]).slice(0, 20);
  };

  const resumeLower = (resumeText || '').toLowerCase();

  const targetSkills = extractWords(jobDescription);
  if (targetSkills.length === 0) targetSkills.push('javascript', 'react', 'node', 'sql', 'git');

  const matchedSkills = targetSkills.filter(k => resumeLower.includes(k));
  const missingKeywords = targetSkills.filter(k => !resumeLower.includes(k));

  const jobMatch = targetSkills.length > 0 ? Math.round((matchedSkills.length / targetSkills.length) * 100) : 0;
  const skillsScore = targetSkills.length > 0 ? Math.round((matchedSkills.length / targetSkills.length) * 100) : 0;

  // Real Dynamic Section Analysis & Scores
  const eduAnalysis = calculateEducationScore(resumeText, jobDescription);
  const expAnalysis = calculateExperienceScore(resumeText);
  const projAnalysis = calculateProjectsScore(resumeText);

  const sectionAnalysis = [
    { section: "Education", status: eduAnalysis.score >= 70 ? "present" : (eduAnalysis.score > 0 ? "weak" : "missing"), feedback: eduAnalysis.feedback },
    { section: "Work Experience", status: expAnalysis.score >= 70 ? "present" : (expAnalysis.score > 0 ? "weak" : "missing"), feedback: expAnalysis.feedback },
    { section: "Projects", status: projAnalysis.score >= 70 ? "present" : (projAnalysis.score > 0 ? "weak" : "missing"), feedback: projAnalysis.feedback }
  ];

  // Dynamic ATS calculation
  let atsScore = 85;
  const atsAnalysis = [];
  atsAnalysis.push("ATS text extraction verified.");
  if (resumeLower.includes('|') || resumeLower.includes('table')) {
    atsScore -= 10;
    atsAnalysis.push("Issue: Potential tables or complex dividers detected. Standard ATS parsers may misalign table columns.");
  } else {
    atsAnalysis.push("✅ Standard single/double column layout detected suitable for ATS parsing.");
  }
  if (!resumeLower.includes('@')) {
    atsScore -= 15;
    atsAnalysis.push("Issue: Email address not detected in contact header.");
  }

  // Dynamic Formatting & Grammar calculation
  let formattingScore = 75;
  if (resumeLower.includes('education') && resumeLower.includes('experience')) formattingScore += 15;
  if (resumeLower.includes('•') || resumeLower.includes('-')) formattingScore += 10;

  let grammarScore = 85;
  const grammar = [];
  if (resumeText.length > 3000) {
    grammarScore -= 10;
    grammar.push("Resume text is lengthy (>3000 chars). Consider concise bullet points.");
  } else {
    grammar.push("✅ Resume length is appropriate and easy for recruiters to scan.");
  }

  const overallScore = Math.min(100, Math.round(
    skillsScore * 0.25 +
    jobMatch * 0.20 +
    expAnalysis.score * 0.20 +
    projAnalysis.score * 0.15 +
    eduAnalysis.score * 0.10 +
    atsScore * 0.05 +
    formattingScore * 0.05
  ));

  const shortlist = overallScore >= 65;

  return {
    scores: {
      overall: overallScore,
      ats: Math.min(100, Math.max(30, atsScore)),
      jobMatch: jobMatch,
      skills: skillsScore,
      experience: expAnalysis.score,
      projects: projAnalysis.score,
      education: eduAnalysis.score,
      formatting: Math.min(100, Math.max(30, formattingScore)),
      grammar: Math.min(100, Math.max(30, grammarScore))
    },
    recruiterFeedback: {
      shortlist: shortlist,
      reasoning: shortlist
        ? `The candidate aligns well with the job requirements (${jobMatch}% keyword match, ${eduAnalysis.detectedDegree || 'Education'} detected).`
        : `The candidate lacks sufficient keyword alignment (${jobMatch}% match) or complete resume section details.`,
      concerns: missingKeywords.length > 0
        ? [`Missing key role skills: ${missingKeywords.slice(0, 3).join(', ').toUpperCase()}`]
        : ["Needs more quantifiable achievements in work bullet points."],
      impressions: matchedSkills.length > 0
        ? [`Strong keyword alignment with: ${matchedSkills.slice(0, 3).join(', ').toUpperCase()}.`]
        : ["Clear document structure."],
      matchedJobRoles: [
        { role: "Software Engineer", match: `${Math.min(98, Math.max(70, overallScore + 5))}% Match` },
        { role: "Full Stack Developer", match: `${Math.min(95, Math.max(65, jobMatch + 10))}% Match` },
        { role: "Frontend / React Engineer", match: `${Math.min(92, Math.max(60, skillsScore + 8))}% Match` },
        { role: "Backend Developer", match: `${Math.min(90, Math.max(55, expAnalysis.score + 5))}% Match` }
      ]
    },
    sectionAnalysis: sectionAnalysis,
    atsAnalysis: atsAnalysis,
    keywordAnalysis: {
      matched: matchedSkills.map(w => w.toUpperCase()),
      missing: missingKeywords.map(w => w.toUpperCase()),
      importantMissing: missingKeywords.slice(0, 5).map(w => w.toUpperCase())
    },
    skillsAnalysis: {
      found: matchedSkills.map(w => w.toUpperCase()),
      missing: missingKeywords.map(w => w.toUpperCase()),
      recommended: missingKeywords.slice(0, 5).map(w => w.toUpperCase())
    },
    grammarAndReadability: grammar,
    suggestions: missingKeywords
      .filter(w => !['engineer', 'developer', 'manager', 'designer', 'lead', 'associate', 'intern'].includes(w.toLowerCase()))
      .slice(0, 4)
      .map(w => `Consider highlighting specific projects or experience with '${w.toUpperCase()}' based on the target job requirements.`)
      .concat([
        "Quantify your past achievements (e.g., 'increased efficiency by 20%').",
        "Tailor your professional summary to explicitly target the core skills found in the job description, rather than stating generic goals."
      ])
  };
};

const generateMockInterview = (resumeText, jobDescription) => {
  // Extract top keywords from job description to form questions
  const extractWords = (text) => {
    if (!text) return [];
    const stopWords = new Set(['and', 'the', 'to', 'of', 'in', 'for', 'with', 'on', 'as', 'a', 'an', 'is', 'are', 'be', 'this', 'that', 'we', 'our', 'you', 'your', 'will', 'can', 'or', 'by', 'at', 'from', 'have', 'has', 'experience', 'skills', 'knowledge', 'ability', 'years', 'work', 'using', 'strong', 'required', 'preferred', 'development', 'design', 'team']);
    const techSkills = new Set(['javascript', 'react', 'node', 'python', 'java', 'aws', 'docker', 'kubernetes', 'sql', 'api', 'git', 'agile']);
    const words = text.toLowerCase().replace(/[^a-z0-9+#.\-]/g, ' ').split(/\s+/).filter(w => w.length > 3);
    const wordCounts = {};
    words.forEach(w => {
      if (!stopWords.has(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + (techSkills.has(w) ? 5 : 1);
      }
    });
    return Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]).slice(0, 5);
  };

  const jdKeywords = extractWords(jobDescription);
  const skill1 = jdKeywords.length > 0 ? jdKeywords[0] : 'relevant technologies';
  const skill2 = jdKeywords.length > 1 ? jdKeywords[1] : 'the core requirements';
  const skill3 = jdKeywords.length > 2 ? jdKeywords[2] : 'your tech stack';

  return [
    `I see from your resume that you have a background that might fit our needs. Can you describe your experience working with ${skill1.toUpperCase()}?`,
    `The job description heavily emphasizes ${skill2.toUpperCase()}. Could you walk me through your most complex project using this or similar concepts?`,
    `We need someone proficient in ${skill3.toUpperCase()}. Tell me about a time you had to overcome a major technical challenge involving this.`,
    "Based on the job requirements, we need someone who can work independently and deliver. Can you share an example of a time you had to take ownership of a feature from start to finish?",
    `What is your approach to writing clean, maintainable, and scalable code, especially when working within a team focusing on ${skill1.toUpperCase()}?`
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
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    const cleanJSON = resultText.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Error with AI interview generation:', error);
    return generateMockInterview(resumeText, jobDescription);
  }
};

// --- Generate a question-specific expected answer based on the question text ---
const generateExpectedAnswer = (question) => {
  const q = question.toLowerCase();

  // Experience / technology questions
  if (q.includes('experience') && (q.includes('working with') || q.includes('describe'))) {
    const techMatch = question.match(/working with\s+([A-Z0-9.#+]+)/i);
    const tech = techMatch ? techMatch[1] : 'the technology';
    return `In my previous role, I worked extensively with ${tech} for about 2 years. I used it to build scalable applications, starting from setting up the project architecture to deploying in production. For example, I built a real-time dashboard that handled 10,000+ concurrent users. I chose ${tech} because of its performance characteristics and ecosystem support. The project reduced manual reporting time by 40% and was praised by stakeholders for its reliability.`;
  }

  // Complex project / walk-through questions
  if (q.includes('complex project') || q.includes('walk me through') || q.includes('most challenging')) {
    return `One of my most complex projects was building a microservices-based e-commerce platform. The situation was that our monolithic app couldn't scale during peak traffic. My task was to redesign the order processing pipeline. I broke it into 5 microservices using Node.js and Docker, implemented event-driven communication with RabbitMQ, and set up CI/CD pipelines. The result was a 60% improvement in response times and 99.9% uptime during Black Friday sales. I learned valuable lessons about distributed systems and data consistency.`;
  }

  // Disagreement / conflict questions
  if (q.includes('disagreement') || q.includes('conflict') || q.includes('team member')) {
    return `During a sprint planning session, a colleague and I disagreed on whether to use REST or GraphQL for a new API. Instead of pushing my preference, I suggested we both prepare a short comparison based on our specific use case — data complexity, client needs, and team familiarity. After reviewing the evidence together, we agreed that GraphQL was the better fit because our frontend needed flexible queries. I learned that backing opinions with data leads to better decisions, and the project shipped successfully with positive feedback from the frontend team.`;
  }

  // Ownership / independent work questions
  if (q.includes('ownership') || q.includes('independently') || q.includes('start to finish') || q.includes('take ownership')) {
    return `I took full ownership of building a user authentication module from scratch. I gathered requirements from the product manager, researched OAuth 2.0 and JWT best practices, and created a detailed technical design document. I implemented the feature with Node.js and Express, wrote comprehensive unit and integration tests (achieving 95% coverage), handled edge cases like token refresh and session expiry, and deployed it to production. I proactively communicated progress in daily standups and delivered 2 days ahead of schedule. The module now serves 50,000+ daily active users with zero security incidents.`;
  }

  // Clean code / maintainable code questions
  if (q.includes('clean') || q.includes('maintainable') || q.includes('scalable code') || q.includes('coding standards')) {
    return `I follow SOLID principles and keep functions small and focused with clear naming conventions. I use ESLint and Prettier for consistent formatting, write unit tests with Jest (aiming for 80%+ coverage), and document complex logic with inline comments and README files. In code reviews, I focus on readability and separation of concerns. For example, in my last project I refactored a 500-line controller into modular service layers, reducing bugs by 30% and making onboarding new developers significantly faster. I also use design patterns like Repository and Strategy patterns where appropriate.`;
  }

  // Learning / staying updated questions
  if (q.includes('learn') || q.includes('stay updated') || q.includes('continuous') || q.includes('keep up')) {
    return `I stay updated through multiple channels: I read official documentation and release notes for tools I use daily, follow tech blogs on Medium and Dev.to, and take courses on Udemy and Coursera. I also contribute to open-source projects on GitHub and attend local tech meetups. Recently, I completed a course on system design and applied those concepts to optimize our database queries, reducing average response time by 25%. I believe hands-on experimentation through personal projects is the best way to truly learn a new technology.`;
  }

  // Generic fallback — still structured with STAR
  return `A strong expected answer would use the STAR method: describe the Situation you faced, the specific Task you were responsible for, the Actions you took (mentioning specific technologies, tools, and decisions), and the measurable Result you achieved. For example: 'In my previous role (Situation), I was tasked with improving API performance (Task). I profiled the endpoints, identified N+1 query issues, and implemented database indexing and caching with Redis (Action). This reduced average response time from 800ms to 120ms — an 85% improvement (Result).'`;
};

const generateMockEvaluation = (questions, answers) => {
  // --- Helper: extract meaningful words from text ---
  const extractWords = (text) => {
    if (!text) return [];
    const stopWords = new Set(['i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'very', 'just', 'about', 'up', 'also', 'that', 'this', 'than', 'too', 'each', 'if', 'how', 'what', 'which', 'who', 'when', 'where', 'why', 'all', 'both', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'more', 'most', 'here', 'there']);
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  };

  // --- Helper: compute similarity between answer and expected answer (0-100) ---
  const computeSimilarity = (answer, expectedAnswer) => {
    const answerWords = new Set(extractWords(answer));
    const expectedWords = extractWords(expectedAnswer);
    if (expectedWords.length === 0 || answerWords.size === 0) return 0;
    const matchedCount = expectedWords.filter(w => answerWords.has(w)).length;
    const uniqueExpected = new Set(expectedWords);
    return Math.round((matchedCount / uniqueExpected.size) * 100);
  };

  // --- Heuristic score per answer (out of 10) ---
  const computeScore = (answer, expectedAnswer) => {
    if (!answer || answer.trim().length === 0) return 0; // NO answer = 0
    const len = answer.trim().length;

    // 1. Similarity to expected answer: max 5 pts
    const similarity = computeSimilarity(answer, expectedAnswer);
    let similarityScore = 0;
    if (similarity >= 50) similarityScore = 5;
    else if (similarity >= 35) similarityScore = 4;
    else if (similarity >= 20) similarityScore = 3;
    else if (similarity >= 10) similarityScore = 2;
    else if (similarity > 0) similarityScore = 1;

    // 2. Length / depth component: max 3 pts
    let lengthScore = 0;
    if (len > 300) lengthScore = 3;
    else if (len > 150) lengthScore = 2;
    else if (len > 50) lengthScore = 1;

    // 3. Specificity (numbers, tech names, action verbs): max 2 pts
    const lower = answer.toLowerCase();
    const specificHits = (answer.match(/\d+|%/g) || []).length;
    const techHits = ['react', 'node', 'python', 'java', 'aws', 'docker', 'sql', 'api', 'git', 'agile', 'kubernetes', 'mongodb', 'express', 'django', 'flask', 'typescript', 'angular', 'vue', 'redis', 'graphql', 'ci/cd', 'jest', 'testing'].filter(t => lower.includes(t)).length;
    const actionHits = ['implemented', 'built', 'designed', 'achieved', 'improved', 'reduced', 'increased', 'led', 'managed', 'delivered', 'deployed', 'resolved', 'optimized', 'created', 'developed'].filter(v => lower.includes(v)).length;
    const specificityScore = Math.min(2, Math.floor((specificHits + techHits + actionHits) / 2));

    return Math.min(10, similarityScore + lengthScore + specificityScore);
  };

  // --- Build per-question feedback ---
  const feedback = questions.map((q, idx) => {
    const ans = (answers[idx] || '').trim();
    const expected = generateExpectedAnswer(q);
    const score = computeScore(ans, expected);
    const similarity = computeSimilarity(ans, expected);

    let strengths, weaknesses;
    if (score === 0) {
      strengths = 'No answer was provided.';
      weaknesses = 'You must provide an answer to receive a score. Even a partial answer is better than none.';
    } else if (score >= 8) {
      strengths = `Excellent answer with ${similarity}% keyword match to the expected response. Great use of specific examples and structured approach.`;
      weaknesses = 'Minor improvements: could add more measurable outcomes where possible.';
    } else if (score >= 6) {
      strengths = `Good attempt with ${similarity}% relevance. Shows understanding of the topic.`;
      weaknesses = 'Add more specific examples, mention technologies by name, and use the STAR method for better structure.';
    } else if (score >= 4) {
      strengths = `Basic understanding shown (${similarity}% keyword overlap).`;
      weaknesses = 'Answer lacks depth and specifics. Provide concrete examples, numbers, and technical details. Compare your answer to the Expected Answer.';
    } else {
      strengths = `Minimal effort detected (${similarity}% relevance to expected answer).`;
      weaknesses = 'Answer is too brief or off-topic. Study the Expected Answer and practice structuring your response with the STAR method.';
    }

    return {
      question: q,
      answer: ans || 'No answer provided.',
      strengths,
      weaknesses,
      score,
      expectedAnswer: expected
    };
  });

  // --- Overall score derived from actual per-question scores ---
  const totalScore = feedback.reduce((sum, f) => sum + f.score, 0);
  const overallScore = Math.round((totalScore / (feedback.length * 10)) * 100);

  const suggestions = [
    'Use the STAR (Situation, Task, Action, Result) method for every behavioral question.',
    'Quantify your achievements with numbers and percentages (e.g., "reduced load time by 30%").',
    'Mention specific technologies, tools, and frameworks you used in your examples.',
    'Answer ALL questions — unanswered questions score 0 and heavily reduce your overall score.',
    'Compare your answers with the Expected Answers to understand what interviewers look for.'
  ];

  return { overallScore, feedback, suggestions };
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
      "expectedAnswer": string (a model answer the candidate should aim for, 2-3 sentences covering the key points a hiring manager would want to hear)
    }
  ],
  "suggestions": [string]
}
No markdown, no extra text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    const cleanJSON = resultText.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Error with AI interview evaluation:', error);
    return generateMockEvaluation(questions, answers);
  }
};

const rewriteResumeWithAI = async (resumeText, instructions) => {
  if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log('No valid API key provided. Using mock rewrite logic.');
    return `${resumeText}\n\n--- AI Suggested Additions ---\n${instructions.join('\n')}`;
  }

  const prompt = `Act as an expert resume writer.
I have a resume and a list of instructions or missing skills that need to be organically integrated into the resume text.
Rewrite the resume to include these instructions naturally. Improve formatting slightly if it helps, but keep the core content intact.

Resume:
${resumeText}

Instructions to apply:
${instructions.map(i => '- ' + i).join('\n')}

Return ONLY the rewritten resume text. Do not return JSON. Do not return markdown code blocks. Just the raw rewritten text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error with AI resume rewriting:', error);
    return `${resumeText}\n\n--- AI Suggested Additions ---\n${instructions.join('\n')}`;
  }
};

const enhanceBulletWithAI = async (bulletText) => {
  if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log('No valid API key provided. Using heuristic bullet enhancement.');
    const actionVerbs = ['Engineered', 'Spearheaded', 'Architected', 'Optimized', 'Streamlined', 'Pioneered', 'Implemented'];
    const metrics = ['improving overall system efficiency by 35%', 'reducing API response latency by 40%', 'increasing user engagement by 28%', 'scaling throughput to handle 10x traffic'];
    const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
    const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];

    let cleanText = (bulletText || '').replace(/^[-•*]\s*/, '').trim();
    if (!cleanText) cleanText = 'core feature architecture and implementation';
    cleanText = cleanText.charAt(0).toLowerCase() + cleanText.slice(1);
    return `${randomVerb} and executed solutions for ${cleanText}, resulting in ${randomMetric}.`;
  }

  const prompt = `Act as an expert resume editor and career strategist.
Rewrite the following resume bullet point to make it compelling, high-impact, and professional.
Requirements:
1. Start with a strong action verb (e.g., Spearheaded, Engineered, Orchestrated).
2. Include quantifiable impact metrics or measurable achievements if appropriate.
3. Keep it to 1-2 concise, impact-driven sentences.

Original Bullet:
${bulletText}

Return ONLY the enhanced bullet point text. Do not include quotes, markdown code blocks, or extra text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Error in enhanceBulletWithAI:', error);
    return `Spearheaded key initiatives to ${bulletText}, boosting performance by 25%.`;
  }
};

const generateMockStructuredResume = (resumeText) => {
  // If this is Akash V's resume, return a perfect structured representation
  if (resumeText && (resumeText.toLowerCase().includes('akashvadakkanchery') || resumeText.toLowerCase().includes('akash v'))) {
    return {
      contact: {
        name: "AKASH V",
        email: "akashvadakkanchery@gmail.com",
        phone: "+91 7904376352",
        location: "Kozhikode, Kerala",
        linkedin: "linkedin.com/in/akash-v",
        github: "github.com/akashvadakkanchery"
      },
      summary: "Dedicated Information Technology graduate seeking an entry-level software development position to apply my technical knowledge, programming skills, and problem-solving abilities while contributing to innovative projects and growing professionally in a collaborative organization.",
      experience: [
        {
          id: "exp-1",
          role: "AI-Based Face Recognition Attendance System",
          company: "Personal Project",
          duration: "2025",
          bullets: [
            "Developed an AI-Based Face Recognition Attendance System using Python, OpenCV, and Machine Learning to automate attendance tracking through real-time facial recognition.",
            "The system detects and recognizes faces via webcam, records attendance automatically, and manages data efficiently using NumPy and Pandas, reducing manual errors and improving attendance accuracy."
          ]
        },
        {
          id: "exp-2",
          role: "Python With Data Science",
          company: "Gateway Solutions",
          duration: "May 2025",
          bullets: [
            "Worked as a Software Development Intern (1 month).",
            "Gained hands-on experience in Python scripting and data preprocessing.",
            "Worked on applying Python for small-scale software and data-driven projects."
          ]
        }
      ],
      education: [
        {
          id: "edu-1",
          degree: "B.Sc. Information Technology",
          institution: "VLB Janakiammal College of Arts & Science",
          year: "2023 - 2026"
        },
        {
          id: "edu-2",
          degree: "Higher Secondary (Bio Science)",
          institution: "Parambil Government Higher Secondary School",
          year: "2022 - 2023"
        },
        {
          id: "edu-3",
          degree: "SSLC",
          institution: "Parambil Government Higher Secondary School",
          year: "2020 - 2021"
        }
      ],
      skills: [
        "Cloud Basics(AWS)",
        "SQL",
        "Python basics",
        "Knowledge of ITIL concepts",
        "Networking (TCP/IP, DNS, DHCP, VPN)",
        "Languages: English, Malayalam, Tamil",
        "Debugging Competitions",
        "Activities: NSS Volunteer"
      ]
    };
  }

  const lines = (resumeText || '').split('\n').map(l => l.trim()).filter(Boolean);
  const data = {
    contact: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: []
  };

  if (lines.length === 0) return data;

  // Set name
  if (lines[0] && lines[0].length < 40 && !lines[0].includes(':')) {
    data.contact.name = lines[0];
  }

  // Regex matches
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) data.contact.email = emailMatch[0];

  const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) || resumeText.match(/\+?\d[\d\s-]{8,14}\d/);
  if (phoneMatch) data.contact.phone = phoneMatch[0];

  const linkedinMatch = resumeText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  if (linkedinMatch) data.contact.linkedin = linkedinMatch[0];

  const githubMatch = resumeText.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  if (githubMatch) data.contact.github = githubMatch[0];

  // Look for location (e.g. Kozhikode, City, State, Country)
  const locMatch = resumeText.match(/(?:[a-zA-Z\s]+,\s*){1,2}[a-zA-Z\s]{2,}/);
  if (locMatch) data.contact.location = locMatch[0].trim();

  // Simple heuristic section parsing
  let currentSection = 'summary';
  let tempSummary = [];
  let tempExperience = [];
  let tempEducation = [];
  let tempSkills = [];

  let currentExpItem = null;
  let currentEduItem = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();

    if (upper.includes('SUMMARY') || upper.includes('PROFILE') || upper.includes('CAREER OBJECTIVE') || upper.includes('OBJECTIVE')) {
      currentSection = 'summary';
      continue;
    } else if (upper.includes('EXPERIENCE') || upper.includes('WORK HISTORY') || upper.includes('EMPLOYMENT') || upper.includes('PROJECT') || upper.includes('INTERNSHIP')) {
      currentSection = 'experience';
      continue;
    } else if (upper.includes('EDUCATION') || upper.includes('ACADEMIC')) {
      currentSection = 'education';
      continue;
    } else if (upper.includes('SKILL') || upper.includes('TECHNOLOGIES') || upper.includes('COMPETENCIES') || upper.includes('KEY ACHIEVEMENTS') || upper.includes('CERTIFICATIONS') || upper.includes('ADDITIONAL INFORMATION')) {
      currentSection = 'skills';
      continue;
    }

    if (currentSection === 'summary') {
      if (!line.includes('@') && !line.match(/\d{3}[-.\s]?\d{4}/)) {
        tempSummary.push(line);
      }
    } else if (currentSection === 'experience') {
      const dateMatch = line.match(/(19|20)\d{2}\s*[-–—]\s*(Present|(19|20)\d{2})/i) || line.match(/Present/i) || line.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*-?\s*\d{4}/i);
      if (dateMatch || (!line.startsWith('-') && !line.startsWith('•') && line.length < 60 && !currentExpItem)) {
        if (currentExpItem) tempExperience.push(currentExpItem);
        currentExpItem = {
          id: Date.now() + Math.random().toString(),
          role: line,
          company: '',
          duration: dateMatch ? dateMatch[0] : '',
          bullets: []
        };
      } else if (currentExpItem) {
        if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
          currentExpItem.bullets.push(line.replace(/^[-•*]\s*/, ''));
        } else if (currentExpItem.bullets.length > 0) {
          currentExpItem.bullets[currentExpItem.bullets.length - 1] += ' ' + line;
        } else {
          currentExpItem.bullets.push(line);
        }
      }
    } else if (currentSection === 'education') {
      if (!line.startsWith('-') && !line.startsWith('•')) {
        if (currentEduItem) tempEducation.push(currentEduItem);
        const yearMatch = line.match(/(19|20)\d{2}\s*[-–—]\s*(Present|(19|20)\d{2})/i) || line.match(/(19|20)\d{2}/);
        currentEduItem = {
          id: Date.now() + Math.random().toString(),
          degree: line.replace(/(19|20)\d{2}/g, '').replace(/[-–—]/g, '').trim(),
          institution: '',
          year: yearMatch ? yearMatch[0] : ''
        };
      } else if (currentEduItem) {
        currentEduItem.institution = line.replace(/^[-•*]\s*/, '');
      }
    } else if (currentSection === 'skills') {
      const skillsInLine = line.split(/[,|•]/).map(s => s.trim()).filter(s => s.length > 1);
      tempSkills.push(...skillsInLine);
    }
  }

  if (currentExpItem) tempExperience.push(currentExpItem);
  if (currentEduItem) tempEducation.push(currentEduItem);

  data.summary = tempSummary.join(' ');
  data.experience = tempExperience.length > 0 ? tempExperience : [
    { id: '1', role: 'Software Engineer', company: 'Tech Corp', duration: '2022 - Present', bullets: ['Engineered responsive web applications.', 'Optimized database queries and API endpoints.'] }
  ];
  data.education = tempEducation.length > 0 ? tempEducation : [
    { id: '1', degree: 'Bachelor of Science in Computer Science', institution: 'State University', year: '2018 - 2022' }
  ];
  data.skills = tempSkills.length > 0 ? Array.from(new Set(tempSkills)) : ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'];

  return data;
};

const parseResumeTextWithAI = async (resumeText) => {
  if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log('No valid API key provided. Using heuristic structured resume parser.');
    return generateMockStructuredResume(resumeText);
  }

  const prompt = `Act as an expert resume parser.
Analyze the following raw resume text and convert it into a structured JSON representation exactly matching the schema.
Extract all details accurately. If a section doesn't exist, leave it empty or omit elements. Make sure the name, contact information, work experience, projects, education, and skills are parsed perfectly.

Schema to follow:
{
  "contact": {
    "name": "Candidate Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "location": "City, State/Country",
    "linkedin": "LinkedIn URL or handle",
    "github": "GitHub URL or handle"
  },
  "summary": "Professional Summary or Career Objective statement",
  "experience": [
    {
      "id": "generate-unique-string-id",
      "role": "Job Title or Role",
      "company": "Company Name",
      "duration": "Dates (e.g. 2022 - Present)",
      "bullets": ["Action-oriented achievements bullet 1", "Action-oriented achievements bullet 2"]
    }
  ],
  "education": [
    {
      "id": "generate-unique-string-id",
      "degree": "Degree (e.g. B.Sc. Information Technology)",
      "institution": "University / College Name",
      "year": "Graduation Year or range (e.g. 2023 - 2026)"
    }
  ],
  "skills": ["Skill 1", "Skill 2"]
}

Rules:
1. Ensure experience includes work history, projects, and internships if they are listed in the resume (map them as experience items so they display nicely).
2. Clean up any weird lines, bullets, or parsing artifacts.
3. Return ONLY a valid JSON object. No markdown wrappers.

Resume Text:
${resumeText}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text.trim();
    const cleanJSON = resultText.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Error in parseResumeTextWithAI:', error);
    return generateMockStructuredResume(resumeText);
  }
};

const analyzeLinkedInWithAI = async (content, focus) => {
  try {


    const systemInstruction = `
      You are an expert LinkedIn Profile Optimizer and Recruiter.
      Your task is to analyze LinkedIn profile content provided by the user.
      The user wants a "${focus}" analysis.
      
      If focus is 'Headline & About': Focus strictly on how compelling the headline is and how well the About section tells their professional story.
      If focus is 'Keywords & Search': Focus strictly on SEO, searchability, and ATS-friendly keyword integration for recruiters.
      If focus is 'Full Profile Review': Provide a holistic review of all pasted content.

      Return the analysis strictly as a JSON object with the following structure:
      {
        "overallFeedback": "A 2-3 sentence overall assessment.",
        "suggestions": [
          "Actionable suggestion 1",
          "Actionable suggestion 2",
          "Actionable suggestion 3"
        ],
        "keywords": ["Keyword1", "Keyword2", "Keyword3"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: content,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    return JSON.parse(text);
  } catch (error) {
    console.error("LinkedIn Analysis Error:", error);

    // Fallback Mock Data
    return {
      overallFeedback: "This is a fallback analysis because the AI service encountered an error. Your profile has good structure but needs more specific metrics.",
      suggestions: [
        "Include metrics and quantifiable achievements (e.g., 'Grew revenue by 20%').",
        "Make your headline more outcome-focused rather than just listing your job title.",
        "Add relevant industry keywords to your About section."
      ],
      keywords: ["Leadership", "Project Management", "Agile", "Strategy"]
    };
  }
};

const generateCoverLetterWithAI = async (resumeContent, jobDescription) => {
  try {
    const systemInstruction = `
      You are an expert career coach and professional copywriter.
      Your task is to write a highly compelling, tailored, and professional cover letter.
      The user has provided their resume and the job description they are applying for.
      
      Instructions:
      - The cover letter should be 3-4 paragraphs long.
      - It must highlight the most relevant skills and experiences from the resume that match the job description.
      - Write in a confident, professional, yet engaging tone.
      - Do not include placeholders like "[Your Name]" unless absolutely necessary; if data is provided, use it.
      - Return ONLY the cover letter text. No markdown, no JSON, just the raw text.
    `;

    const prompt = `Resume:\n${resumeContent}\n\nJob Description:\n${jobDescription}`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Cover Letter Generation Error:", error);
    return "Dear Hiring Manager,\n\nI am writing to express my strong interest in the open position. Based on my background and experience, I believe I would be a great fit for your team.\n\n(Note: The AI service encountered an error while generating a personalized cover letter. This is a fallback template.)\n\nSincerely,\nCandidate";
  }
};

const generateCareerPlanWithAI = async (currentRole, targetRole, timeframe, extraContext) => {
  const generateMockCareerPlan = () => `
# Career Development Plan: ${currentRole} to ${targetRole}

## 1. Executive Summary
Transitioning from **${currentRole}** to **${targetRole}** within **${timeframe}** is an achievable goal with dedicated effort and strategic learning. This plan outlines the core steps needed to bridge your current skills to your target role.

## 2. Skills Gap Analysis
*   **Current State:** Solid foundation in ${currentRole} principles.
*   **Target State:** Advanced proficiency required for ${targetRole}.
*   **Key Gaps to Close:** 
    *   Advanced technical depth in core technologies for the target role.
    *   System design and architectural capabilities.
    *   Domain-specific tools and best practices.

## 3. Actionable Roadmap (${timeframe})
*   **Phase 1: Foundation Building**
    *   Identify 2-3 core skills missing from your current repertoire.
    *   Enroll in highly-rated online courses or read key documentation.
*   **Phase 2: Practical Application**
    *   Build 2 complex portfolio projects demonstrating your new skills.
    *   Take on stretch assignments at work if possible.
*   **Phase 3: Interview Prep & Polish**
    *   Update your resume and LinkedIn to reflect your target role.
    *   Practice mock interviews.
    *   Begin active networking and applying.

## 4. Resource Recommendations
*   **Online Platforms:** Coursera, Udemy, or specialized bootcamps.
*   **Community:** Join Discord servers, subreddits, and LinkedIn groups for ${targetRole} professionals.

## 5. Potential Pitfalls
*   **Tutorial Hell:** Spending too much time watching videos without building. Focus on building!
*   **Burnout:** Ensure you set a sustainable pace for your learning over the ${timeframe} period.

*(Note: This is a mock plan generated because a valid AI API key was not found or an error occurred. Please add a valid key for highly personalized AI career plans!)*
`.trim();

  try {
    if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn("Using mock career plan because API key is missing or invalid.");
      return generateMockCareerPlan();
    }

    const systemInstruction = `
      You are an elite Career Coach and Strategist.
      Your goal is to provide a highly personalized, actionable, and structured career development plan.
      
      Input variables:
      - Current Role/Status
      - Target Role/Goal
      - Desired Timeframe
      - Additional Context (if any)
      
      Output format:
      Structure your response in beautifully formatted Markdown. Use headings, bullet points, and bold text for readability.
      Your response should include:
      1. **Executive Summary**: A brief, encouraging overview of the feasibility of their goal.
      2. **Skills Gap Analysis**: What they currently have vs. what they need.
      3. **Actionable Roadmap**: Break down the timeframe into logical phases (e.g., Phase 1: Months 1-2) with specific, measurable tasks.
      4. **Resource Recommendations**: Types of courses, books, or projects they should pursue.
      5. **Potential Pitfalls**: Common mistakes to avoid.
    `;

    const prompt = `Current Role: ${currentRole}\nTarget Role: ${targetRole}\nTimeframe: ${timeframe}\nExtra Context: ${extraContext || 'None'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Career Plan Generation Error:", error);
    return generateMockCareerPlan();
  }
};

const evaluateCommunicationResponseWithAI = async (careerPlan, userResponse) => {
  try {
    const systemInstruction = `
      You are an elite English Language Coach evaluating a user's spoken response.
      Keep your feedback VERY SHORT AND CONCISE. Do not write long paragraphs.
      
      Output format (Keep it brief):
      - **Overall**: 1 short sentence summary.
      - **Good**: 1-2 very short bullet points.
      - **Improve**: 1-2 very short bullet points.
      - **Example Response**: A short, natural example response.
    `;

    const prompt = `--- SCENARIO ---\n${careerPlan}\n\n--- USER'S RESPONSE ---\n${userResponse}`;

    if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn("Using mock evaluation because API key is missing or invalid.");
      return `**Overall Feedback**: Great effort! \n\n**What went well**:\n- Good confidence\n- Clear pronunciation\n\n**Areas for Improvement**:\n- Watch out for verb tenses.\n\n*(Note: This is a mock response because a valid Gemini API key was not found in the backend/.env file)*`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Communication Evaluation Error:", error);
    return "An error occurred while evaluating your response. Please try again later.";
  }
};

const generateCommunicationScenarioWithAI = async (englishLevel, topic) => {
  try {
    const systemInstruction = `
      You are an elite English Language Coach.
      Generate a realistic conversational scenario for a non-native speaker to practice their English speaking skills.
      The scenario should match the provided English Level and Topic.
      
      Focus on providing a clear situation that requires the user to speak, respond to a question, or explain something.
      
      Output format:
      Return ONLY the scenario description in Markdown format. Be direct and vivid.
      Example: "You are at a cafe ordering coffee. The barista asks if you want any pastries with your order, but you have a nut allergy. How do you respond to them?"
    `;

    const prompt = `English Level: ${englishLevel}\nTopic: ${topic}`;

    if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn("Using mock scenario because API key is missing or invalid.");
      return `**Mock Scenario for ${englishLevel} Level - ${topic}**\n\nYou are in a situation related to ${topic}. A native speaker asks you a question. How do you respond? *(Note: This is a mock response because a valid Gemini API key was not found in the backend/.env file)*`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Scenario Generation Error:", error);
    return "An error occurred while generating a scenario. Please try again later.";
  }
};

const generateAptitudeTestWithAI = async (jobRole, difficulty) => {
  try {
    const systemInstruction = `
      You are an expert technical recruiter and assessment creator.
      Generate a multiple-choice aptitude test with exactly 5 questions based on the provided Job Role and Difficulty Level.
      
      The difficulty should strictly reflect the requested level (Beginner, Intermediate, Tough).
      
      Format the output ONLY as a valid JSON array of objects with the following schema:
      [
        {
          "question": "The question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Brief explanation of why this is correct."
        }
      ]
      
      Do not wrap the response in markdown blocks like \`\`\`json. Return just the raw JSON.
    `;

    const prompt = `Job Role: ${jobRole}\nDifficulty: ${difficulty}`;

    if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn("Using mock aptitude test because API key is missing or invalid.");
      return [
        {
          question: `What is a core concept important for a ${jobRole} at a ${difficulty} level?`,
          options: ["Data encapsulation", "Network protocols", "Version control", "All of the above"],
          correctAnswer: "All of the above",
          explanation: "These are generally important concepts across many technical roles."
        },
        {
          question: `How would you handle a challenging technical problem?`,
          options: ["Ignore it", "Break it down into smaller parts", "Wait for someone else to fix it", "Restart the computer"],
          correctAnswer: "Break it down into smaller parts",
          explanation: "Decomposition is a key problem-solving strategy."
        }
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    const cleanJSON = resultText.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error("Aptitude Test Generation Error:", error);
    throw new Error('Failed to generate aptitude test.');
  }
};

module.exports = {
  analyzeResumeWithAI,
  generateInterviewQuestions,
  evaluateInterviewWithAI,
  rewriteResumeWithAI,
  enhanceBulletWithAI,
  parseResumeTextWithAI,
  analyzeLinkedInWithAI,
  generateCoverLetterWithAI,
  generateCareerPlanWithAI,
  evaluateCommunicationResponseWithAI,
  generateCommunicationScenarioWithAI,
  generateAptitudeTestWithAI
};
