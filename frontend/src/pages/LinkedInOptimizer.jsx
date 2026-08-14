import React, { useState } from 'react';
import { FaLinkedin, FaMagic, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { analyzeLinkedIn } from '../services/api';
import styles from './LinkedInOptimizer.module.css';

const LinkedInOptimizer = () => {
  const [url, setUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [experience, setExperience] = useState('');
  const [focus, setFocus] = useState('Full Profile Review');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const focusOptions = ['Full Profile Review', 'Headline & About', 'Keywords & Search'];

  const handleAnalyze = async () => {
    if (!headline.trim() && !about.trim() && !experience.trim()) {
      setError('Please provide at least some profile content to analyze.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    const content = `Headline: ${headline}\n\nAbout: ${about}\n\nExperience: ${experience}`;

    try {
      const response = await analyzeLinkedIn({ content, focus });
      setResult(response);
    } catch (err) {
      setError(err.error || 'Failed to analyze profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FaLinkedin />
        </div>
        <div>
          <h1 className={styles.headerTitle}>LinkedIn Profile Analyzer</h1>
          <div className={styles.headerSub}>Free • Powered by Gemini AI • Results in ~10 seconds</div>
        </div>
      </div>

      <div className={styles.content}>
        {error && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaExclamationCircle /> {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>Your LinkedIn Profile URL</label>
          <div className={styles.inputWrapper}>
            <FaLinkedin className={styles.inputIcon} />
            <input 
              type="text" 
              className={styles.input} 
              placeholder="https://www.linkedin.com/in/yourname" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Paste Your Profile Content</label>
          <span className={styles.subLabel}>LinkedIn blocks automated scraping. Copy your sections manually below.</span>
          
          <label className={styles.label} style={{ fontSize: '0.85rem', marginTop: '1rem' }}>Headline</label>
          <textarea 
            className={styles.textarea} style={{ minHeight: '60px' }}
            placeholder="Senior Product Manager | Ex-Google | Building AI products..."
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          ></textarea>

          <label className={styles.label} style={{ fontSize: '0.85rem', marginTop: '1rem' }}>About Section</label>
          <textarea 
            className={styles.textarea} style={{ minHeight: '100px' }}
            placeholder="I'm a product manager with 7+ years of experience..."
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          ></textarea>

          <label className={styles.label} style={{ fontSize: '0.85rem', marginTop: '1rem' }}>Experience</label>
          <textarea 
            className={styles.textarea} style={{ minHeight: '120px' }}
            placeholder="Senior PM at Company • 2022-Present&#10;Led roadmap for 3 core features..."
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Analysis Focus</label>
          <div className={styles.focusGroup}>
            {focusOptions.map(opt => (
              <button 
                key={opt}
                className={`${styles.focusBtn} ${focus === opt ? styles.focusBtnActive : ''}`}
                onClick={() => setFocus(opt)}
              >
                {focus === opt && <FaCheckCircle />} {opt}
              </button>
            ))}
          </div>
        </div>

        <button 
          className={styles.submitBtn} 
          onClick={handleAnalyze} 
          disabled={loading || (!headline.trim() && !about.trim() && !experience.trim())}
        >
          <FaMagic /> {loading ? 'Analyzing Profile...' : 'Analyze My LinkedIn Profile — Free'}
        </button>

        {result && (
          <div className={styles.results}>
            <h2 style={{ color: 'var(--primary)', marginTop: 0 }}>Analysis Results</h2>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginTop: 0 }}>Overall Feedback</h3>
              <p style={{ color: '#d4d4d8', lineHeight: 1.6 }}>{result.overallFeedback}</p>
              
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginTop: '1.5rem' }}>Actionable Suggestions</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.2rem', color: '#d4d4d8' }}>
                {result.suggestions?.map((sugg, i) => (
                  <li key={i}>{sugg}</li>
                ))}
              </ul>

              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginTop: '1.5rem' }}>Keywords to Add</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {result.keywords?.map((kw, i) => (
                  <span key={i} style={{ background: '#3f3f46', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInOptimizer;
