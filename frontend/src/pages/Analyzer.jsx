import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ResumeUpload from '../components/ResumeUpload';
import JobDescriptionInput from '../components/JobDescriptionInput';
import Loader from '../components/Loader';
import ScoreCard from '../components/ScoreCard';
import AnalysisCard from '../components/AnalysisCard';
import MockInterview from '../components/MockInterview';
import { analyzeResume, generateInterview } from '../services/api';

const Analyzer = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState(null);

  // Scroll to results when they arrive
  useEffect(() => {
    if (result && !interviewQuestions) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [result]);

  useEffect(() => {
    if (interviewQuestions) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [interviewQuestions]);

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a resume file.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const data = await analyzeResume(formData);
      setResult(data);
    } catch (err) {
      setError(err.error || 'An unexpected error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInterview = async () => {
    setError('');
    setInterviewLoading(true);
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const data = await generateInterview(formData);
      setInterviewQuestions(data.questions);
    } catch (err) {
      setError(err.error || 'Failed to generate interview questions.');
    } finally {
      setInterviewLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '3rem' }}>AI Resume Analysis</h1>
        
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
            <ResumeUpload file={file} setFile={setFile} />
            <JobDescriptionInput jobDescription={jobDescription} setJobDescription={setJobDescription} />
            
            {error && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                {error}
              </div>
            )}
            
            <button 
              className="btn btn-primary" 
              onClick={handleAnalyze} 
              disabled={loading}
              style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}
            >
              {loading ? 'Analyzing...' : 'Analyze Resume Fit'}
            </button>
          </div>

          {loading && <Loader />}
          
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}
            >

              {/* Overall Score Banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="glass"
                style={{
                  padding: '2.5rem 2rem',
                  borderRadius: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                  border: '1px solid rgba(168,85,247,0.3)',
                  textAlign: 'center'
                }}
              >
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>
                  Overall Resume Score
                </h3>

                {/* Circular Score Gauge */}
                <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                  <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background ring */}
                    <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                    {/* Score arc */}
                    <motion.circle
                      cx="75" cy="75" r="60"
                      fill="none"
                      stroke={
                        (result.scores?.overall || 0) >= 80
                          ? 'var(--success)'
                          : (result.scores?.overall || 0) >= 60
                          ? 'var(--warning)'
                          : 'var(--error)'
                      }
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - (result.scores?.overall || 0) / 100) }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    />
                  </svg>
                  {/* Score number in centre */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        lineHeight: 1,
                        color: (result.scores?.overall || 0) >= 80
                          ? 'var(--success)'
                          : (result.scores?.overall || 0) >= 60
                          ? 'var(--warning)'
                          : 'var(--error)'
                      }}
                    >
                      {result.scores?.overall || 0}
                    </motion.span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>/ 100</span>
                  </div>
                </div>

                {/* Label */}
                <div style={{
                  padding: '0.4rem 1.2rem',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: (result.scores?.overall || 0) >= 80
                    ? 'rgba(16,185,129,0.15)'
                    : (result.scores?.overall || 0) >= 60
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(239,68,68,0.15)',
                  color: (result.scores?.overall || 0) >= 80
                    ? 'var(--success)'
                    : (result.scores?.overall || 0) >= 60
                    ? 'var(--warning)'
                    : 'var(--error)',
                  border: '1px solid ' + ((result.scores?.overall || 0) >= 80
                    ? 'rgba(16,185,129,0.3)'
                    : (result.scores?.overall || 0) >= 60
                    ? 'rgba(245,158,11,0.3)'
                    : 'rgba(239,68,68,0.3)')
                }}>
                  {(result.scores?.overall || 0) >= 80
                    ? '🏆 Excellent Match'
                    : (result.scores?.overall || 0) >= 60
                    ? '✅ Good Match'
                    : '⚠️ Needs Improvement'}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, maxWidth: '420px' }}>
                  This score reflects how well your resume aligns with the job description based on skills, experience, ATS compatibility, and presentation.
                </p>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <ScoreCard scores={result.scores} />
                
                <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                    Recruiter Feedback
                  </h3>
                  <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: result.recruiterFeedback?.shortlist ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: '1px solid ' + (result.recruiterFeedback?.shortlist ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)') }}>
                    <h4 style={{ color: result.recruiterFeedback?.shortlist ? 'var(--success)' : 'var(--error)' }}>
                      Decision: {result.recruiterFeedback?.shortlist ? 'Shortlist for Interview' : 'Do Not Shortlist'}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{result.recruiterFeedback?.reasoning}</p>
                  </div>
                  {result.recruiterFeedback?.impressions?.length > 0 && (
                    <div>
                      <h5 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Impressions</h5>
                      <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem', margin: 0 }}>
                        {result.recruiterFeedback.impressions.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.recruiterFeedback?.concerns?.length > 0 && (
                    <div>
                      <h5 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>Concerns</h5>
                      <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem', margin: 0 }}>
                        {result.recruiterFeedback.concerns.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <AnalysisCard title="Skills Found" items={result.skillsAnalysis?.found} type="success" />
                <AnalysisCard title="Missing Skills" items={result.skillsAnalysis?.missing} type="error" />
                <AnalysisCard title="Recommended Skills" items={result.skillsAnalysis?.recommended} type="warning" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <AnalysisCard title="Matched Keywords" items={result.keywordAnalysis?.matched} type="success" />
                <AnalysisCard title="Important Missing Keywords" items={result.keywordAnalysis?.importantMissing} type="error" />
              </div>

              <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>Section-by-Section Analysis</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.sectionAnalysis?.map((section, i) => (
                    <div key={i} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                      <strong style={{ color: 'var(--primary)' }}>{section.section}: </strong>
                      <span style={{ color: 'var(--text-muted)' }}>{section.feedback}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <AnalysisCard title="ATS Analysis" items={result.atsAnalysis} type="warning" />
                <AnalysisCard title="Grammar & Readability" items={result.grammarAndReadability} type="success" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <AnalysisCard title="Key Improvement Suggestions" items={result.suggestions} type="warning" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleGenerateInterview}
                  disabled={interviewLoading}
                  style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', backgroundColor: 'var(--accent)' }}
                >
                  {interviewLoading ? 'Generating Questions...' : 'Practice Mock Interview'}
                </button>
              </div>

              {interviewQuestions && <MockInterview questions={interviewQuestions} />}
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default Analyzer;
