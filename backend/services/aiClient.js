const { GoogleGenAI } = require('@google/genai');
const config = require('../config/env');

let aiInstance = null;

const getAI = () => {
  if (!aiInstance) {
    const key = global.GEMINI_API_KEY_OVERRIDE || config.geminiApiKey;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in Settings.");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

const updateAIKey = (newKey) => {
  global.GEMINI_API_KEY_OVERRIDE = newKey;
  aiInstance = new GoogleGenAI({ apiKey: newKey });
};

module.exports = {
  getAI,
  updateAIKey
};
