import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const analyzeResume = async (formData) => {
  try {
    const response = await api.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const generateInterview = async (formData) => {
  try {
    const response = await api.post('/analyze/interview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const evaluateInterviewAnswers = async (data) => {
  try {
    const response = await api.post('/analyze/evaluate-interview', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const rewriteResume = async (data) => {
  try {
    const response = await api.post('/analyze/rewrite-resume', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const enhanceBullet = async (bulletText) => {
  try {
    const response = await api.post('/analyze/enhance-bullet', { bulletText }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const parseResumeFile = async (formData) => {
  try {
    const response = await api.post('/analyze/parse-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const analyzeLinkedIn = async (data) => {
  try {
    const response = await api.post('/analyze/linkedin', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const generateCoverLetter = async (data) => {
  try {
    const response = await api.post('/analyze/cover-letter', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const generateCareerPlan = async (data) => {
  try {
    const response = await api.post('/analyze/career-plan', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const evaluateCommunication = async (data) => {
  try {
    const response = await api.post('/analyze/evaluate-communication', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const generateScenario = async (data) => {
  try {
    const response = await api.post('/analyze/generate-scenario', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};

export const generateAptitudeTest = async (data) => {
  try {
    const response = await api.post('/analyze/aptitude-test', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred' };
  }
};
export const scrapeJobUrl = async (url) => {
  try {
    const response = await api.post('/analyze/scrape-job', { url });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred while scraping' };
  }
};

export const updateApiKey = async (apiKey) => {
  try {
    const response = await api.post('/settings/api-key', { apiKey });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error occurred while updating API key' };
  }
};

export default api;
