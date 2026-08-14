import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ResumeUpload from '../components/ResumeUpload';
import JobDescriptionInput from '../components/JobDescriptionInput';
import MockInterview from '../components/MockInterview';
import { analyzeResume, generateInterview, parseResumeFile } from '../services/api';
import { useAnalyzer } from '../context/AnalyzerContext';

/* ── Minimal helper components (no symbols/emojis) ── */
const Pill = ({ label, color = '#10b981', onAdd = null }) => (
  <span 
    onClick={onAdd ? () => onAdd(label) : undefined}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.2rem 0.5rem', borderRadius: '0.25rem',
      fontSize: '0.725rem', fontWeight: 600,
      background: `${color}10`, color, border: `1px solid ${color}25`,
      cursor: onAdd ? 'pointer' : 'default',
      transition: 'all 0.2s'
    }}
    title={onAdd ? 'Click to add to Resume Builder' : ''}
  >
    {label}
    {onAdd && (
      <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>+</span>
    )}
  </span>
);

const ScoreBar = ({ label, value, color }) => (
  <div style={{ marginBottom: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
      <span style={{ color: '#8f8f9e', fontSize: '0.8rem' }}>{label}</span>
      <span style={{ fontWeight: 700, color, fontSize: '0.8rem' }}>
        {value ?? '–'}<span style={{ color: '#3f3f46', fontWeight: 400 }}>/100</span>
      </span>
    </div>
    <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value ?? 0}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ height: '100%', borderRadius: '2px', background: color }}
      />
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{
    background: '#121214',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '0.375rem',
    padding: '1.25rem',
    marginBottom: '1rem'
  }}>
    {title && (
      <div style={{
        fontSize: '0.7rem', fontWeight: 700, color: '#8f8f9e',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        marginBottom: '0.85rem'
      }}>
        {title}
      </div>
    )}
    {children}
  </div>
);

const ItemList = ({ items, color, onAdd = null }) => {
  if (!items?.length) return <p style={{ color: '#3f3f46', fontSize: '0.8rem', margin: 0 }}>None found.</p>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {items.map((item, i) => <Pill key={i} label={item} color={color} onAdd={onAdd} />)}
    </div>
  );
};

const FeedbackRow = ({ items, color }) => {
  if (!items?.length) return null;
  return (
    <ul style={{ margin: '0.35rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: '0.4rem', color: '#8f8f9e', fontSize: '0.8rem', alignItems: 'flex-start' }}>
          <span style={{ color, flexShrink: 0, marginTop: '2px' }}>•</span>
          {item}
        </li>
      ))}
    </ul>
  );
};

/* ── Tabs (No icons/symbols) ── */
const TABS = [
  { id: 'score',     label: 'Match Score' },
  { id: 'skills',    label: 'Skill Gaps' },
  { id: 'keywords',  label: 'Keywords' },
  { id: 'ats',       label: 'ATS Checker' },
  { id: 'sections',  label: 'Section Review' },
  { id: 'suggest',   label: 'Suggestions' },
  { id: 'interview', label: 'Mock Interview', hidden: true },
];

/* ── Main Page ── */
const Analyzer = () => {
  const {
    file, setFile,
    jobDescription, setJobDescription,
    jobTitle, setJobTitle,
    companyName, setCompanyName,
    result, setResult,
    interviewQuestions, setInterviewQuestions,
    activeTab, setActiveTab
  } = useAnalyzer();

  const [loading, setLoading] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  
  const navigate = useNavigate();

  // Load history on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('resume_analysis_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) { console.error('Failed to load history'); }

    // Listen for data imported from the Chrome extension
    const checkImportedData = async () => {
      try {
        const imported = localStorage.getItem('imported_job_data');
        if (imported) {
          const parsed = JSON.parse(imported);
          if (parsed.jobTitle) setJobTitle(parsed.jobTitle);
          if (parsed.company) setCompanyName(parsed.company);
          if (parsed.content) setJobDescription(parsed.content);
          
          if (parsed.resumeBase64) {
            // Convert base64 to File object
            try {
              const fetchResponse = await fetch(parsed.resumeBase64);
              const blob = await fetchResponse.blob();
              const file = new File([blob], parsed.resumeName || 'resume.pdf', { type: parsed.resumeType || 'application/pdf' });
              setFile(file);
            } catch (err) {
              console.error("Failed to parse resume from extension", err);
            }
          }
          
          if (parsed.analysisResult) {
            setResult(parsed.analysisResult);
            // Optionally save it to history immediately
            const combinedText = `Job Title: ${parsed.jobTitle}\nCompany: ${parsed.company}\n\nDescription:\n${parsed.content}`;
            saveToHistory(parsed.analysisResult, combinedText);
          }
          
          // Clear it so we don't import it again on next refresh unless it's new
          localStorage.removeItem('imported_job_data');
        }
      } catch (e) { console.error('Failed to load imported data', e); }
    };

    // Check on initial load
    checkImportedData();

    // Listen for changes from the extension (which runs in another tab/context)
    const handleStorageChange = () => {
      // We don't check e.key because the content script might dispatch a generic Event
      checkImportedData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen to a custom event just in case
    window.addEventListener('extension_data_imported', checkImportedData);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('extension_data_imported', checkImportedData);
    };
  }, []);

  const saveToHistory = (newResult, jobDesc) => {
    const newItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      displayTitle: jobTitle ? jobTitle + (companyName ? ` at ${companyName}` : '') : jobDesc.slice(0, 30) + (jobDesc.length > 30 ? '...' : ''),
      fullJobDescription: jobDesc,
      savedJobTitle: jobTitle,
      savedCompanyName: companyName,
      jobTitle: jobDesc.slice(0, 30) + (jobDesc.length > 30 ? '...' : ''), // Legacy for backward compatibility
      score: newResult.scores?.overall || 0,
      result: newResult
    };
    const updated = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(updated);
    localStorage.setItem('resume_analysis_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('resume_analysis_history');
  };

  const loadHistoryItem = (item) => {
    setResult(item.result);
    setJobDescription(item.fullJobDescription || item.jobTitle || ''); // item.jobTitle is legacy truncated version
    setJobTitle(item.savedJobTitle || '');
    setCompanyName(item.savedCompanyName || '');
    setActiveTab('score');
    setInterviewQuestions(null);
  };

  const scoreColor = (v) =>
    !v ? '#3f3f46' : v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#ef4444';

  const handleAnalyze = async () => {
    if (!file) { setError('Please upload a resume.'); return; }
    if (!jobDescription.trim()) { setError('Please provide a job description.'); return; }
    setError(''); setLoading(true); setResult(null); setInterviewQuestions(null); setActiveTab('score');
    const fd = new FormData();
    fd.append('resume', file);
    
    let combinedJobDescription = jobDescription;
    if (jobTitle || companyName) {
      combinedJobDescription = `Job Title: ${jobTitle}\nCompany Name: ${companyName}\n\n${jobDescription}`;
    }
    fd.append('jobDescription', combinedJobDescription);
    try {
      const data = await analyzeResume(fd);
      setResult(data);
      saveToHistory(data, jobDescription);
    } catch (err) {
      setError(err.error || 'An error occurred during analysis.');
    } finally { setLoading(false); }
  };

  const handleGenerateInterview = async () => {
    if (!file) { setError('Original resume PDF is required to generate an interview.'); return; }
    setError(''); setInterviewLoading(true);
    const fd = new FormData();
    fd.append('resume', file);
    
    let combinedJobDescription = jobDescription;
    if (jobTitle || companyName) {
      combinedJobDescription = `Job Title: ${jobTitle}\nCompany Name: ${companyName}\n\n${jobDescription}`;
    }
    fd.append('jobDescription', combinedJobDescription);
    try {
      const data = await generateInterview(fd);
      setInterviewQuestions(data.questions);
      setActiveTab('interview');
    } catch (err) {
      setError(err.error || 'Failed to generate interview.');
    } finally { setInterviewLoading(false); }
  };

  const handleAddSkill = async (skill) => {
    if (!file) { setError('Original resume PDF is required to add skills. Please re-upload it.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const parsedData = await parseResumeFile(fd);
      // Ensure skills array exists and add the new skill
      const existingSkills = parsedData.skills || [];
      if (!existingSkills.includes(skill)) {
        parsedData.skills = [...existingSkills, skill];
      }
      navigate('/builder', { state: { importedData: parsedData } });
    } catch (err) {
      setError('Failed to transition to Builder: ' + (err.error || err.message));
      setLoading(false);
    }
  };

  const overall = result?.scores?.overall ?? 0;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* Header bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '1rem 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '0.02em', color: '#fff' }}>
            Resume Fit Analyzer
          </h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <div className="analyzer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}>

          {/* LEFT panel */}
          <div className="input-sticky" style={{ position: 'sticky', top: '1rem' }}>
            <div style={{
              background: '#121214',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '0.375rem',
              padding: '1.25rem'
            }}>
              <ResumeUpload file={file} setFile={setFile} />
              <JobDescriptionInput 
                jobDescription={jobDescription} setJobDescription={setJobDescription} 
                jobTitle={jobTitle} setJobTitle={setJobTitle}
                companyName={companyName} setCompanyName={setCompanyName}
              />

              {error && (
                <div style={{
                  padding: '0.6rem 0.8rem', borderRadius: '0.25rem',
                  background: 'rgba(239,68,68,0.05)', color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.15)',
                  fontSize: '0.775rem', marginBottom: '0.85rem'
                }}>
                  {error}
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', borderRadius: '0.25rem', fontWeight: 700 }}
              >
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </button>

              {result && (
                <button
                  className="btn btn-outline"
                  onClick={handleGenerateInterview}
                  disabled={interviewLoading}
                  style={{
                    width: '100%', padding: '0.725rem', fontSize: '0.8rem',
                    borderRadius: '0.25rem', marginTop: '0.5rem',
                    borderColor: 'rgba(16,185,129,0.25)', color: '#10b981'
                  }}
                >
                  {interviewLoading ? 'Generating...' : 'Practice Interview'}
                </button>
              )}

              {/* Score Indicator */}
              {result && (
                <div style={{
                  marginTop: '1rem', padding: '1rem',
                  background: '#09090b', borderRadius: '0.25rem',
                  border: '1px solid rgba(255,255,255,0.03)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#8f8f9e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 700 }}>
                    Overall Match
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor(overall), fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    {overall}<span style={{ fontSize: '0.9rem', color: '#3f3f46', fontWeight: 400 }}>/100</span>
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.725rem', fontWeight: 700, color: scoreColor(overall), textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {overall >= 80 ? 'Excellent Match' : overall >= 60 ? 'Good Match' : 'Needs Work'}
                  </div>
                </div>
              )}
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div style={{
                marginTop: '1rem',
                background: '#121214',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '0.375rem',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8f8f9e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Recent Analyses
                  </div>
                  <button
                    onClick={clearHistory}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: 0
                    }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {history.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => loadHistoryItem(item)}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '0.25rem',
                        padding: '0.75rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.displayTitle || item.jobTitle || 'Analysis'}
                        </div>
                        <div style={{ color: '#8f8f9e', fontSize: '0.65rem', marginTop: '0.15rem' }}>{item.date}</div>
                      </div>
                      <div style={{ 
                        color: scoreColor(item.score), 
                        fontSize: '0.8rem', fontWeight: 800, 
                        background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.4rem', borderRadius: '4px'
                      }}>
                        {item.score}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT panel */}
          <div>
            {!loading && !result && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '380px', gap: '0.75rem', textAlign: 'center',
                background: '#121214', borderRadius: '0.375rem',
                border: '1px dashed rgba(255,255,255,0.04)'
              }}>
                <h2 style={{ color: '#f4f4f5', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Ready to analyze</h2>
                <p style={{ color: '#8f8f9e', maxWidth: '300px', margin: 0, fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Provide your resume and a target description on the left to start.
                </p>
              </div>
            )}

            {loading && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '380px', gap: '1rem',
                background: '#121214', borderRadius: '0.375rem',
                border: '1px solid rgba(255,255,255,0.04)'
              }}>
                <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>Analyzing...</div>
              </div>
            )}

            {!loading && result && (
              <div>
                {/* Clean tabs (no symbols/icons) */}
                <div className="tab-nav" style={{
                  display: 'flex', gap: '0.5rem', overflowX: 'auto',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  marginBottom: '1.25rem',
                }}>
                  {TABS.filter(t => !t.hidden || (t.id === 'interview' && interviewQuestions)).map(tab => {
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          border: 'none', cursor: 'pointer',
                          background: 'transparent',
                          borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                          color: active ? '#fff' : '#8f8f9e',
                          fontWeight: active ? 700 : 500,
                          fontSize: '0.775rem', whiteSpace: 'nowrap',
                          fontFamily: 'inherit', position: 'relative',
                          marginBottom: '-1px'
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* SCORE */}
                    {activeTab === 'score' && (
                      <>
                        <Section title="Score Breakdown">
                          {[
                            { k: 'jobMatch',    label: 'Job Match' },
                            { k: 'skills',      label: 'Skills Score' },
                            { k: 'experience',  label: 'Experience' },
                            { k: 'education',   label: 'Education' },
                            { k: 'projects',    label: 'Projects' },
                            { k: 'ats',         label: 'ATS Score' },
                            { k: 'formatting',  label: 'Formatting' },
                            { k: 'grammar',     label: 'Grammar' },
                          ]
                            .filter(s => result.scores?.[s.k] !== undefined)
                            .map(({ k, label }) => (
                              <ScoreBar key={k} label={label} value={result.scores[k]} color={scoreColor(result.scores[k])} />
                            ))}
                        </Section>

                        <Section title="Verdict">
                          <div style={{
                            padding: '0.85rem', borderRadius: '0.25rem', marginBottom: '0.85rem',
                            background: result.recruiterFeedback?.shortlist ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
                            border: `1px solid ${result.recruiterFeedback?.shortlist ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`
                          }}>
                            <div style={{ fontWeight: 700, color: result.recruiterFeedback?.shortlist ? '#10b981' : '#ef4444', marginBottom: '0.3rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {result.recruiterFeedback?.shortlist ? 'Shortlisted' : 'Not Shortlisted'}
                            </div>
                            <p style={{ color: '#8f8f9e', margin: 0, fontSize: '0.825rem', lineHeight: 1.55 }}>
                              {result.recruiterFeedback?.reasoning}
                            </p>
                          </div>

                          {result.recruiterFeedback?.impressions?.length > 0 && (
                            <div style={{ marginBottom: '0.75rem' }}>
                              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Impressions</div>
                              <FeedbackRow items={result.recruiterFeedback.impressions} color="#10b981" />
                            </div>
                          )}
                          {result.recruiterFeedback?.concerns?.length > 0 && (
                            <div style={{ marginBottom: '0.75rem' }}>
                              <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Concerns</div>
                              <FeedbackRow items={result.recruiterFeedback.concerns} color="#f59e0b" />
                            </div>
                          )}
                        </Section>
                      </>
                    )}

                    {/* SKILLS */}
                    {activeTab === 'skills' && (
                      <>
                        <Section title="Found in Resume">
                          <ItemList items={result.skillsAnalysis?.found} color="#10b981" />
                        </Section>
                        <Section title="Missing (Required by JD)">
                          <ItemList items={result.skillsAnalysis?.missing} color="#ef4444" onAdd={handleAddSkill} />
                        </Section>
                        <Section title="Recommended to Add">
                          <ItemList items={result.skillsAnalysis?.recommended} color="#f59e0b" onAdd={handleAddSkill} />
                        </Section>
                      </>
                    )}

                    {/* KEYWORDS */}
                    {activeTab === 'keywords' && (
                      <>
                        <Section title="Matched Keywords">
                          <ItemList items={result.keywordAnalysis?.matched} color="#10b981" />
                        </Section>
                        <Section title="Missing Keywords">
                          <ItemList items={result.keywordAnalysis?.importantMissing} color="#ef4444" onAdd={handleAddSkill} />
                        </Section>
                      </>
                    )}

                    {/* ATS */}
                    {activeTab === 'ats' && (
                      <Section title="ATS Checker">
                        {!result.atsAnalysis?.length && (
                          <p style={{ color: '#3f3f46', fontSize: '0.8rem', margin: 0 }}>No issues found.</p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {result.atsAnalysis?.map((item, i) => (
                            <div key={i} style={{
                              padding: '0.65rem 0.85rem',
                              background: 'rgba(245,158,11,0.03)',
                              border: '1px solid rgba(245,158,11,0.1)',
                              borderRadius: '0.25rem',
                              color: '#8f8f9e', fontSize: '0.8rem',
                              display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
                            }}>
                              <span style={{ color: '#f59e0b', flexShrink: 0 }}>•</span>{item}
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {/* SECTIONS */}
                    {activeTab === 'sections' && (
                      <Section title="Section Review">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {result.sectionAnalysis?.map((s, i) => (
                            <div key={i} style={{
                              padding: '0.75rem',
                              background: 'rgba(255,255,255,0.01)',
                              borderRadius: '0.25rem',
                              borderLeft: '2px solid rgba(16,185,129,0.3)'
                            }}>
                              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.775rem', marginBottom: '0.2rem' }}>{s.section}</div>
                              <div style={{ color: '#8f8f9e', fontSize: '0.8rem', lineHeight: 1.5 }}>{s.feedback}</div>
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {/* SUGGESTIONS */}
                    {activeTab === 'suggest' && (
                      <>
                        <Section title="Improvement Suggestions">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {result.suggestions?.map((item, i) => (
                              <div key={i} style={{
                                padding: '0.65rem 0.85rem',
                                background: 'rgba(255,255,255,0.01)',
                                border: '1px solid rgba(255,255,255,0.03)',
                                borderRadius: '0.25rem',
                                color: '#8f8f9e', fontSize: '0.8rem',
                                display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
                              }}>
                                <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{item}
                              </div>
                            ))}
                          </div>
                        </Section>
                        <Section title="Grammar & Readability">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {result.grammarAndReadability?.map((item, i) => (
                              <div key={i} style={{
                                padding: '0.65rem 0.85rem',
                                background: 'rgba(16,185,129,0.03)',
                                border: '1px solid rgba(16,185,129,0.1)',
                                borderRadius: '0.25rem',
                                color: '#8f8f9e', fontSize: '0.8rem',
                                display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
                              }}>
                                <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>{item}
                              </div>
                            ))}
                          </div>
                        </Section>
                      </>
                    )}

                    {/* INTERVIEW */}
                    {activeTab === 'interview' && interviewQuestions && (
                      <MockInterview questions={interviewQuestions} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analyzer;
