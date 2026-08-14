const fs = require('fs');
const path = require('path');
const { updateAIKey } = require('../services/aiClient');
const config = require('../config/env');

const updateApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Update in-memory AI client
    updateAIKey(apiKey);

    // Update the .env file permanently
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Replace or append GEMINI_API_KEY
    if (envContent.includes('GEMINI_API_KEY=')) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${apiKey}`);
    } else {
      envContent += `\nGEMINI_API_KEY=${apiKey}\n`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    
    // Also update config for consistency
    config.geminiApiKey = apiKey;

    res.status(200).json({ message: 'API key updated successfully' });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
};

module.exports = {
  updateApiKey
};
