import React, { useState } from 'react';
import { FaBrain, FaCrosshairs, FaCalendarAlt, FaInfoCircle, FaCopy, FaDownload, FaComments, FaMicrophone, FaStop, FaQuestionCircle, FaVolumeUp } from 'react-icons/fa';
import { generateCareerPlan, generateScenario, evaluateCommunication, generateAptitudeTest } from '../services/api';
import ReactMarkdown from 'react-markdown';
import AptitudeTest from '../components/AptitudeTest';
import styles from './CoachHub.module.css';

const CoachHub = () => {
  const [activeTab, setActiveTab] = useState('career'); // 'career' or 'english'

  // --- Career Coach State ---
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [careerLoading, setCareerLoading] = useState(false);
  const [careerError, setCareerError] = useState('');
  const [careerResult, setCareerResult] = useState('');

  // --- English Practice State ---
  const [englishLevel, setEnglishLevel] = useState('Intermediate');
  const [topic, setTopic] = useState('Casual Chat');
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [scenarioError, setScenarioError] = useState('');
  const [scenario, setScenario] = useState('');
  const [isSpeakingScenario, setIsSpeakingScenario] = useState(false);
  
  const [userResponse, setUserResponse] = useState('');
  const [evaluationFeedback, setEvaluationFeedback] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState('');
  
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // --- Aptitude Test State ---
  const [aptitudeJobRole, setAptitudeJobRole] = useState('');
  const [aptitudeDifficulty, setAptitudeDifficulty] = useState('Beginner');
  const [aptitudeLoading, setAptitudeLoading] = useState(false);
  const [aptitudeError, setAptitudeError] = useState('');
  const [aptitudeQuestions, setAptitudeQuestions] = useState(null);

  const playVoice = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isSpeakingScenario) {
        setIsSpeakingScenario(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeakingScenario(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingScenario(true);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  // --- Career Coach Methods ---
  const handleGenerateCareerPlan = async () => {
    if (!currentRole.trim() || !targetRole.trim() || !timeframe.trim()) {
      setCareerError('Please provide your current role, target role, and timeframe.');
      return;
    }
    
    setCareerLoading(true);
    setCareerError('');
    try {
      const response = await generateCareerPlan({ currentRole, targetRole, timeframe, extraContext });
      setCareerResult(response.plan);
    } catch (err) {
      setCareerError(err.error || 'Failed to generate career plan.');
    } finally {
      setCareerLoading(false);
    }
  };

  const copyCareerPlan = () => {
    navigator.clipboard.writeText(careerResult);
    alert('Career plan copied to clipboard!');
  };

  const downloadCareerPlan = () => {
    const element = document.createElement("a");
    const file = new Blob([careerResult], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "Career_Plan.md";
    document.body.appendChild(element); 
    element.click();
  };

  // --- English Practice Methods ---
  const handleGenerateScenario = async () => {
    setLoadingScenario(true);
    setScenarioError('');
    setScenario('');
    setEvaluationFeedback('');
    setUserResponse('');
    
    try {
      const response = await generateScenario({ englishLevel, topic });
      setScenario(response.scenario);
    } catch (err) {
      setScenarioError(err.error || 'Failed to generate a scenario.');
    } finally {
      setLoadingScenario(false);
    }
  };

  const handleEvaluate = async () => {
    if (!userResponse.trim()) {
      setEvaluationError('Please provide your response to the scenario.');
      return;
    }
    
    setIsEvaluating(true);
    setEvaluationError('');
    try {
      const resp = await evaluateCommunication({ careerPlan: scenario, userResponse });
      setEvaluationFeedback(resp.feedback);
    } catch (err) {
      setEvaluationError(err.error || 'Failed to evaluate response.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setEvaluationError("Your browser doesn't support Speech Recognition. Please type your response.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setUserResponse((prev) => prev + finalTranscript);
      }
    };

    rec.onerror = (event) => {
      setEvaluationError('Speech recognition error: ' + event.error);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.start();
    setRecognition(rec);
    setIsListening(true);
  };

  // --- Aptitude Test Methods ---
  const handleGenerateAptitudeTest = async () => {
    if (!aptitudeJobRole.trim()) {
      setAptitudeError('Please provide a job role or description.');
      return;
    }
    
    setAptitudeLoading(true);
    setAptitudeError('');
    setAptitudeQuestions(null);
    try {
      const response = await generateAptitudeTest({ jobRole: aptitudeJobRole, difficulty: aptitudeDifficulty });
      setAptitudeQuestions(response.test);
    } catch (err) {
      setAptitudeError(err.error || 'Failed to generate aptitude test.');
    } finally {
      setAptitudeLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'career' ? styles.active : ''}`}
          onClick={() => setActiveTab('career')}
        >
          <FaBrain style={{ marginRight: '0.5rem' }} />
          Career Coach
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'english' ? styles.active : ''}`}
          onClick={() => setActiveTab('english')}
        >
          <FaComments style={{ marginRight: '0.5rem' }} />
          English Practice
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'aptitude' ? styles.active : ''}`}
          onClick={() => setActiveTab('aptitude')}
        >
          <FaQuestionCircle style={{ marginRight: '0.5rem' }} />
          Aptitude Test
        </button>
      </div>

      {activeTab === 'career' ? (
        <div className={styles.content}>
          {careerError && (
            <div className={styles.errorBanner}>
              <span style={{ fontWeight: 'bold' }}>Error:</span> {careerError}
            </div>
          )}

          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FaCrosshairs style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                Current Role / Status
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="E.g., Junior Frontend Developer, or Recent CS Graduate"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FaCrosshairs style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                Target Role / Goal
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="E.g., Senior Full Stack Engineer, or Product Manager"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FaCalendarAlt style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                Desired Timeframe
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="E.g., 6 months, 2 years"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FaInfoCircle style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                Additional Context (Optional)
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="E.g., Can study 10 hrs/week, interested in AI"
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
              />
            </div>
          </div>

          <button 
            className={styles.submitBtn} 
            onClick={handleGenerateCareerPlan}
            disabled={careerLoading}
          >
            {careerLoading ? 'Generating Your Plan...' : 'Generate Career Plan'}
          </button>

          {careerResult && (
            <div className={styles.results}>
              <div className={styles.resultsHeader}>
                <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                  Your Personalized Career Plan
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={copyCareerPlan} className={styles.actionBtn}>
                    <FaCopy /> Copy
                  </button>
                  <button onClick={downloadCareerPlan} className={styles.actionBtn}>
                    <FaDownload /> Download
                  </button>
                </div>
              </div>
              
              <div className={styles.markdownContainer}>
                <ReactMarkdown>{careerResult}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'english' ? (
        <div className={styles.content}>
          {scenarioError && (
            <div className={styles.errorBanner}>
              <span style={{ fontWeight: 'bold' }}>Error:</span> {scenarioError}
            </div>
          )}

          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FaCrosshairs style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                English Level
              </label>
              <select
                className={styles.input}
                value={englishLevel}
                onChange={(e) => setEnglishLevel(e.target.value)}
                style={{ appearance: 'auto' }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FaComments style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                Practice Topic
              </label>
              <select
                className={styles.input}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ appearance: 'auto' }}
              >
                <option value="Casual Chat">Casual Chat</option>
                <option value="Job Interview">Job Interview</option>
                <option value="Business Meeting">Business Meeting</option>
                <option value="Ordering Food">Ordering Food</option>
                <option value="Travel / Airport">Travel / Airport</option>
              </select>
            </div>
          </div>

          <button 
            className={styles.submitBtn} 
            onClick={handleGenerateScenario}
            disabled={loadingScenario}
          >
            {loadingScenario ? 'Generating Scenario...' : 'Generate Speaking Scenario'}
          </button>

          {scenario && (
            <div className={styles.results}>
              <div className={styles.resultsHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-light)' }}>
                  Your English Practice Scenario
                </h2>
                <button 
                  onClick={() => playVoice(scenario)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: isSpeakingScenario ? 'var(--warning)' : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.4rem', borderRadius: '50%',
                    backgroundColor: isSpeakingScenario ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)'
                  }}
                  title={isSpeakingScenario ? "Stop speaking" : "Listen to scenario"}
                >
                  <FaVolumeUp size={16} />
                </button>
              </div>
              
              <div className={styles.markdownContainer}>
                <ReactMarkdown>{scenario}</ReactMarkdown>
              </div>

              <div className={styles.practiceSection}>
                <div className={styles.practiceHeader}>
                  <FaMicrophone style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
                  <h3 style={{ margin: 0, color: 'var(--text-light)' }}>Speak Your Response</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Click the microphone and speak your response in English. Or type it if you prefer.
                </p>

                {evaluationError && (
                  <div className={styles.errorBanner} style={{ padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {evaluationError}
                  </div>
                )}

                <div className={styles.practiceInputArea}>
                  <textarea
                    className={styles.practiceTextarea}
                    placeholder="Click the microphone to speak, or type your response here..."
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                  />
                  <button 
                    className={`${styles.micBtn} ${isListening ? styles.listening : ''}`}
                    onClick={toggleListening}
                    title={isListening ? "Stop listening" : "Start speaking"}
                  >
                    {isListening ? <FaStop /> : <FaMicrophone />}
                  </button>
                </div>

                <button 
                  className={styles.submitPracticeBtn} 
                  onClick={handleEvaluate}
                  disabled={isEvaluating || !userResponse.trim()}
                >
                  {isEvaluating ? 'Evaluating...' : 'Submit for Feedback'}
                </button>

                {evaluationFeedback && (
                  <div className={styles.feedbackSection}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-light)' }}>AI Coach Feedback</h4>
                    <div className={styles.markdownContainer} style={{ background: 'var(--bg-dark)', padding: '1rem' }}>
                      <ReactMarkdown>{evaluationFeedback}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'aptitude' ? (
        <div className={styles.content}>
          {aptitudeError && (
            <div className={styles.errorBanner}>
              <span style={{ fontWeight: 'bold' }}>Error:</span> {aptitudeError}
            </div>
          )}

          {!aptitudeQuestions ? (
            <>
              <div className={styles.grid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FaCrosshairs style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                    Job Role / Description
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="E.g., React Developer or paste a job description snippet"
                    value={aptitudeJobRole}
                    onChange={(e) => setAptitudeJobRole(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FaBrain style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                    Difficulty Level
                  </label>
                  <select
                    className={styles.input}
                    value={aptitudeDifficulty}
                    onChange={(e) => setAptitudeDifficulty(e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Tough">Tough</option>
                  </select>
                </div>
              </div>

              <button 
                className={styles.submitBtn} 
                onClick={handleGenerateAptitudeTest}
                disabled={aptitudeLoading}
                style={{ marginTop: '1.5rem' }}
              >
                {aptitudeLoading ? 'Generating Test...' : 'Generate Aptitude Test'}
              </button>
            </>
          ) : (
            <AptitudeTest 
              questions={aptitudeQuestions} 
              onRestart={() => setAptitudeQuestions(null)} 
            />
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CoachHub;
