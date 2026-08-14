import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { evaluateInterviewAnswers } from '../../services/api';

const MockInterview = ({ questions }) => {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarItem, setSidebarItem] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef(null);

  // Setup Speech Recognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    let finalTranscript = answers[activeQuestion] || '';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + transcript;
        } else {
          interim = transcript;
        }
      }
      const newAnswers = [...answers];
      newAnswers[activeQuestion] = finalTranscript + (interim ? ` ${interim}` : '');
      setAnswers(newAnswers);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleTextChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[activeQuestion] = e.target.value;
    setAnswers(newAnswers);
  };

  const playVoice = (text, id) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.9;
      utterance.onend = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const openSidebar = (item) => {
    setSidebarItem(item);
    setSidebarOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await evaluateInterviewAnswers({ questions, answers });
      setEvaluation(data);
    } catch (err) {
      setError(err.error || 'Failed to evaluate interview answers.');
    } finally {
      setLoading(false);
    }
  };

  if (!questions || questions.length === 0) return null;

  const voiceBtnStyle = (isActive) => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: isActive ? 'var(--warning)' : 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem',
    backgroundColor: isActive ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
    borderRadius: '50%',
    transition: 'all 0.2s',
    flexShrink: 0
  });

  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: '#121214',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '0.375rem',
          padding: '1.25rem'
        }}
      >
        <h3 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Mock Interview Practice
        </h3>

        {!evaluation ? (
          <>
            {/* Progress Bar */}
            <div style={{ marginBottom: '1rem', height: '3px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '1.5px', overflow: 'hidden' }}>
              <div style={{ width: `${((activeQuestion + (answers[activeQuestion] ? 1 : 0)) / questions.length) * 100}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', overflowX: 'auto' }} className="tab-nav">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveQuestion(index)}
                  className="btn"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.75rem',
                    backgroundColor: activeQuestion === index ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: activeQuestion === index ? '#fff' : '#8f8f9e',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Question {index + 1}
                </button>
              ))}
            </div>

            {/* Question Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeQuestion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '0.25rem', marginBottom: '1rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <p style={{ color: '#f4f4f5', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                    {questions[activeQuestion]}
                  </p>
                  <button
                    onClick={() => playVoice(questions[activeQuestion], `q-${activeQuestion}`)}
                    title={speakingId === `q-${activeQuestion}` ? 'Stop' : 'Play Question'}
                    style={voiceBtnStyle(speakingId === `q-${activeQuestion}`)}
                  >
                    {speakingId === `q-${activeQuestion}` ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                </div>

                {/* Answer area */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ color: '#8f8f9e', fontSize: '0.725rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Your Answer</label>
                    <button onClick={startListening}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem',
                        backgroundColor: isListening ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isListening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}`, 
                        borderRadius: '0.25rem', 
                        color: isListening ? 'var(--error)' : '#8f8f9e', 
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isListening ? 'Stop Recording' : 'Speak Answer'}
                    </button>
                  </div>
                  <textarea
                    value={answers[activeQuestion]}
                    onChange={handleTextChange}
                    rows={4}
                    placeholder="Type your response here, or click 'Speak Answer' to record..."
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '0.25rem', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      backgroundColor: 'rgba(0,0,0,0.2)', 
                      color: '#f4f4f5',
                      fontFamily: 'inherit',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {error && <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn"
                  onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                  disabled={activeQuestion === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    color: activeQuestion === 0 ? '#3f3f46' : '#fff',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '0.25rem',
                    cursor: activeQuestion === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>
                <button
                  className="btn"
                  onClick={() => setActiveQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={activeQuestion === questions.length - 1}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    color: activeQuestion === questions.length - 1 ? '#3f3f46' : '#fff',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '0.25rem',
                    cursor: activeQuestion === questions.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '0.25rem', fontWeight: 700 }}
              >
                {loading ? 'Evaluating...' : 'Submit Answers'}
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Beautiful Score Gauge Area */}
            <div style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', 
              marginBottom: '2rem', padding: '2rem', 
              backgroundColor: 'rgba(255,255,255,0.02)', 
              borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' 
            }}>
              <h4 style={{ color: '#8f8f9e', fontSize: '0.8rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Overall Performance</h4>
              
              <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="transparent" 
                    stroke={evaluation.overallScore >= 80 ? 'var(--success)' : evaluation.overallScore >= 60 ? 'var(--warning)' : 'var(--error)'} 
                    strokeWidth="8" 
                    strokeDasharray={`${(evaluation.overallScore / 100) * 283} 283`}
                    strokeLinecap={evaluation.overallScore === 0 ? 'butt' : 'round'}
                    initial={{ strokeDasharray: '0 283' }}
                    animate={{ strokeDasharray: `${(evaluation.overallScore / 100) * 283} 283` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {evaluation.overallScore}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#8f8f9e', textTransform: 'uppercase', marginTop: '0.2rem' }}>out of 100</span>
                </div>
              </div>
            </div>

            {/* Feedback Breakdown */}
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Question Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {evaluation.feedback.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', borderLeft: `4px solid ${item.score >= 7 ? 'var(--success)' : item.score >= 5 ? 'var(--warning)' : 'var(--error)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                        {idx + 1}. {item.question}
                      </h5>
                      <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, 
                        color: item.score >= 7 ? 'var(--success)' : item.score >= 5 ? 'var(--warning)' : 'var(--error)'
                      }}>
                        {item.score}/10
                      </div>
                    </div>
                    <p style={{ color: '#a1a1aa', fontStyle: 'italic', fontSize: '0.85rem', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                      " {item.answer || 'No answer provided.'} "
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        <div style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Strengths</div>
                        <div style={{ color: '#d4d4d8', fontSize: '0.8rem', lineHeight: 1.4 }}>{item.strengths || 'No specific strengths identified.'}</div>
                      </div>
                      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <div style={{ color: 'var(--error)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Needs Improvement</div>
                        <div style={{ color: '#d4d4d8', fontSize: '0.8rem', lineHeight: 1.4 }}>{item.weaknesses || 'No specific areas for improvement identified.'}</div>
                      </div>
                    </div>
                  </div>

                  {item.expectedAnswer && (
                    <div style={{ padding: '1.25rem', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                          Ideal Expected Answer
                        </div>
                        <button
                          onClick={() => playVoice(item.expectedAnswer, `expected-${idx}`)}
                          title={speakingId === `expected-${idx}` ? 'Stop' : 'Listen'}
                          style={voiceBtnStyle(speakingId === `expected-${idx}`)}
                        >
                          {speakingId === `expected-${idx}` ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                          )}
                        </button>
                      </div>
                      <p style={{ color: '#e4e4e7', margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {item.expectedAnswer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* General Suggestions */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '0.5rem' }}>
              <h4 style={{ color: 'var(--warning)', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Actionable Suggestions</h4>
              <ul style={{ color: '#d4d4d8', margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {evaluation.suggestions?.map((sugg, idx) => <li key={idx}>{sugg}</li>)}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <button className="btn btn-outline" style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }} onClick={() => { setEvaluation(null); setSidebarOpen(false); }}>
                Practice Again
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ---- Sidebar Overlay ---- */}
      <AnimatePresence>
        {sidebarOpen && sidebarItem && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSidebarOpen(false); window.speechSynthesis.cancel(); setSpeakingId(null); }}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40 }}
            />

            <motion.div
              key="sidebar"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '380px', maxWidth: '95vw',
                backgroundColor: '#121214',
                borderLeft: '1px solid rgba(255,255,255,0.04)',
                zIndex: 50,
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expected Answer</h3>
                <button
                  onClick={() => { setSidebarOpen(false); window.speechSynthesis.cancel(); setSpeakingId(null); }}
                  style={{ background: 'none', border: 'none', color: '#8f8f9e', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}
                >×</button>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '0.25rem' }}>
                <p style={{ color: '#8f8f9e', fontSize: '0.725rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Question</p>
                <p style={{ color: '#fff', margin: 0, lineHeight: 1.5, fontSize: '0.825rem' }}>{sidebarItem.question}</p>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: 'rgba(239,68,68,0.02)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '0.25rem' }}>
                <p style={{ color: 'var(--error)', fontSize: '0.725rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Answer</p>
                <p style={{ color: '#8f8f9e', margin: 0, fontStyle: 'italic', lineHeight: 1.5, fontSize: '0.825rem' }}>{sidebarItem.answer || 'No answer.'}</p>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: 'rgba(16,185,129,0.02)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <p style={{ color: 'var(--success)', fontSize: '0.725rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expected Answer</p>
                  <button
                    onClick={() => playVoice(sidebarItem.expectedAnswer, 'sidebar-expected')}
                    title={speakingId === 'sidebar-expected' ? 'Stop' : 'Listen'}
                    style={voiceBtnStyle(speakingId === 'sidebar-expected')}
                  >
                    {speakingId === 'sidebar-expected' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                </div>
                <p style={{ color: '#f4f4f5', margin: 0, lineHeight: 1.6, fontSize: '0.85rem' }}>{sidebarItem.expectedAnswer}</p>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '0.25rem' }}>
                <p style={{ color: 'var(--success)', fontSize: '0.725rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Strengths</p>
                <p style={{ color: '#8f8f9e', margin: 0, lineHeight: 1.5, fontSize: '0.8rem' }}>{sidebarItem.strengths}</p>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '0.25rem' }}>
                <p style={{ color: 'var(--error)', fontSize: '0.725rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>To Improve</p>
                <p style={{ color: '#8f8f9e', margin: 0, lineHeight: 1.5, fontSize: '0.8rem' }}>{sidebarItem.weaknesses}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockInterview;
