import React, { useState } from 'react';
import { FaEnvelope, FaFileAlt, FaBriefcase, FaCopy, FaDownload } from 'react-icons/fa';
import { generateCoverLetter } from '../services/api';
import { useAnalyzer } from '../context/AnalyzerContext';
import styles from './CoverLetterBuilder.module.css';

const CoverLetterBuilder = () => {
  const { result: analyzerResult, jobDescription: analyzerJobDescription, jobTitle: ctxJobTitle, companyName: ctxCompanyName } = useAnalyzer();
  const [resumeContent, setResumeContent] = useState(analyzerResult?.resumeText || '');
  const [jobDescription, setJobDescription] = useState(analyzerJobDescription || '');
  const [name, setName] = useState(analyzerResult?.structuredData?.contact?.name || '');
  const [jobTitle, setJobTitle] = useState(ctxJobTitle || '');
  const [companyName, setCompanyName] = useState(ctxCompanyName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!resumeContent.trim() || !jobDescription.trim()) {
      setError('Please provide both your resume content and the job description.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    let combinedJobDescription = jobDescription;
    if (name || jobTitle || companyName) {
      combinedJobDescription = `Applicant Name: ${name}\nTarget Job Title: ${jobTitle}\nTarget Company: ${companyName}\n\n${jobDescription}`;
    }

    try {
      const response = await generateCoverLetter({ resumeContent, jobDescription: combinedJobDescription });
      setResult(response.coverLetter);
    } catch (err) {
      setError(err.error || 'Failed to generate cover letter.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert('Cover letter copied to clipboard!');
  };

  const downloadAsText = () => {
    const element = document.createElement("a");
    const file = new Blob([result], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Cover_Letter.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FaEnvelope />
        </div>
        <div>
          <h1 className={styles.headerTitle}>Cover Letter Builder</h1>
          <p className={styles.headerSub}>Generate a highly tailored cover letter using AI</p>
        </div>
      </div>

      <div className={styles.content}>
        {error && (
          <div className={styles.errorBanner}>
            <span style={{ fontWeight: 'bold' }}>Error:</span> {error}
          </div>
        )}

        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FaFileAlt style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
              Your Details
            </label>
            <p className={styles.subLabel}>These fields are pre-filled if you used the Resume Analyzer.</p>
            
            <input
              type="text"
              className={styles.input}
              placeholder="Your Full Name (e.g. John Doe)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
            
            <input
              type="text"
              className={styles.input}
              placeholder="Target Job Title (e.g. Senior Developer)"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
            
            <input
              type="text"
              className={styles.input}
              placeholder="Target Company Name (e.g. Acme Corp)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
          </div>

          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label}>
              <FaFileAlt style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
              Your Resume Content
            </label>
            <p className={styles.subLabel}>Paste your resume text here. The AI will use your background to personalize the letter.</p>
            <textarea
              className={styles.textarea}
              placeholder="E.g., Senior Software Engineer with 5+ years of experience in React, Node.js..."
              value={resumeContent}
              onChange={(e) => setResumeContent(e.target.value)}
            />
          </div>

          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label}>
              <FaBriefcase style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
              Job Description
            </label>
            <p className={styles.subLabel}>Paste the job description of the role you are applying for.</p>
            <textarea
              className={styles.textarea}
              placeholder="E.g., We are looking for a Frontend Developer who is proficient in..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>

        <button 
          className={styles.submitBtn} 
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating Cover Letter...' : 'Generate Cover Letter'}
        </button>

        {result && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                Your Generated Cover Letter
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={copyToClipboard} className={styles.actionBtn}>
                  <FaCopy /> Copy
                </button>
                <button onClick={downloadAsText} className={styles.actionBtn}>
                  <FaDownload /> Download
                </button>
              </div>
            </div>
            
            <textarea 
              className={styles.resultTextarea} 
              value={result} 
              onChange={(e) => setResult(e.target.value)} 
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Feel free to edit the generated cover letter directly in the box above before copying or downloading.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverLetterBuilder;
