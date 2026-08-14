const { getAI } = require('./aiClient');

const ai = {
  get models() {
    return getAI().models;
  }
};
const model = 'gemini-flash-lite-latest'; // Same model used elsewhere to avoid quota issues

/**
 * Scrapes a job URL using Jina Reader API and extracts structured data using Gemini.
 * @param {string} url - The job posting URL.
 * @returns {Promise<{ jobTitle: string, companyName: string, jobDescription: string }>}
 */
const scrapeJobUrl = async (url) => {
  try {
    // 1. Fetch raw markdown from Jina Reader API
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Jina Reader: ${response.status} ${response.statusText}`);
    }

    const markdownText = await response.text();

    if (!markdownText || markdownText.trim().length === 0) {
      throw new Error("No content found at the provided URL.");
    }

    // 2. Use Gemini to extract Job Title, Company Name, and Job Description
    const prompt = `
You are an expert HR data extractor. I have scraped the text of a job posting webpage.
Your task is to accurately extract the following three fields from the text:
1. Job Title
2. Company Name
3. Job Description (the full responsibilities, requirements, and about the role)

Return ONLY a valid JSON object with the exact keys: "jobTitle", "companyName", "jobDescription".
If any field cannot be found, set its value to an empty string "".

Raw Webpage Text:
"""
${markdownText.slice(0, 30000)} // Limit length to avoid massive payloads, 30k chars is usually enough for a job posting
"""
    `;

    const aiResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedText = aiResponse.text;
    const data = JSON.parse(parsedText);

    return {
      jobTitle: data.jobTitle || "",
      companyName: data.companyName || "",
      jobDescription: data.jobDescription || ""
    };

  } catch (error) {
    console.error("Error in scrapeJobUrl:", error);
    throw new Error(error.message || "Failed to scrape job URL.");
  }
};

module.exports = {
  scrapeJobUrl
};
