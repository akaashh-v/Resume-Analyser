import React, { useState } from 'react';
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

    // Stop if already listening
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
      // Update the active answer live
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

  // ---- Styles ----
  const voiceBtnStyle = (isActive) => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: isActive ? 'var(--warning)' : 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem',
    backgroundColor: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(99, 102, 241, 0.1)',
    borderRadius: '50%',
    transition: 'all 0.2s',
    flexShrink: 0
  });

  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{ padding: '2rem', borderRadius: '1rem', marginTop: '2rem' }}
      >
        <h3 style={{ color: 'var(--text-light)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          Mock Interview Practice
        </h3>

        {!evaluation ? (
          <>
            {/* Question Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveQuestion(index)}
                  className="btn"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: activeQuestion === index ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: activeQuestion === index ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Question {index + 1}
                </button>
              ))}
            </div>

            {/* Question + Voice */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <p style={{ color: 'var(--text-light)', fontSize: '1.125rem', lineHeight: '1.6', margin: 0 }}>
                  {questions[activeQuestion]}
                </p>
                <button
                  onClick={() => playVoice(questions[activeQuestion], `q-${activeQuestion}`)}
                  title={speakingId === `q-${activeQuestion}` ? 'Stop' : 'Play Question'}
                  style={voiceBtnStyle(speakingId === `q-${activeQuestion}`)}
                >
                  {speakingId === `q-${activeQuestion}` ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Answer Text Area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ color: 'var(--text-muted)' }}>Your Answer (Practice Area):</label>
                <button
                  onClick={startListening}
                  title={isListening ? 'Stop Recording' : 'Speak Your Answer'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.9rem',
                    backgroundColor: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.12)',
                    color: isListening ? 'var(--error)' : 'var(--primary)',
                    border: isListening ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    animation: isListening ? 'pulse 1.5s infinite' : 'none'
                  }}
                >
                  {isListening ? (
                    <>
                      {/* Stop icon */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>
                      Stop Recording
                    </>
                  ) : (
                    <>
                      {/* Mic icon */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>
                      Speak Answer
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={answers[activeQuestion]}
                onChange={handleTextChange}
                placeholder={isListening ? '🎙️ Listening... speak your answer now' : 'Type your response here, or click "Speak Answer" to use your microphone...'}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '1rem',
                  backgroundColor: isListening ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.05)',
                  border: isListening ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-light)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  transition: 'border 0.2s, background 0.2s'
                }}
              />
              {isListening && (
                <p style={{ color: 'var(--primary)', fontSize: '0.78rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--error)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                  Recording... Click "Stop Recording" when done.
                </p>
              )}
            </div>

            {error && <div style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ padding: '0.75rem 2rem' }}
              >
                {loading ? 'Evaluating with AI...' : 'Submit Answers for AI Evaluation'}
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Overall Score */}
            <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Overall Interview Score</h4>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: evaluation.overallScore >= 80 ? 'var(--success)' : evaluation.overallScore >= 60 ? 'var(--warning)' : 'var(--error)' }}>
                {evaluation.overallScore}/100
              </div>
            </div>

            {/* Feedback per question */}
            <h4 style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>Feedback Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {evaluation.feedback.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '0.5rem',
                    borderLeft: `4px solid ${item.score >= 7 ? 'var(--success)' : item.score >= 5 ? 'var(--warning)' : 'var(--error)'}`
                  }}
                >
                  <p style={{ color: 'var(--text-light)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Q: {item.question}</p>
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>Your Answer: {item.answer || 'No answer provided.'}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ color: 'var(--success)' }}><strong>Strengths:</strong> {item.strengths}</div>
                    <div style={{ color: 'var(--error)' }}><strong>Areas to Improve:</strong> {item.weaknesses}</div>
                    <div style={{ color: 'var(--primary)', marginTop: '0.5rem' }}><strong>Score:</strong> {item.score}/10</div>
                  </div>

                  {/* Ideal Answer Button */}
                  {item.idealAnswer && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button
                        onClick={() => openSidebar(item)}
                        style={{
                          padding: '0.4rem 1rem',
                          backgroundColor: 'rgba(168,85,247,0.15)',
                          color: '#c084fc',
                          border: '1px solid rgba(168,85,247,0.3)',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        💡 See Ideal Answer
                      </button>
                      <button
                        onClick={() => playVoice(item.idealAnswer, `ideal-${idx}`)}
                        title={speakingId === `ideal-${idx}` ? 'Stop' : 'Listen to Ideal Answer'}
                        style={voiceBtnStyle(speakingId === `ideal-${idx}`)}
                      >
                        {speakingId === `ideal-${idx}` ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        )}
                      </button>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Listen to ideal answer</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* General Suggestions */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem' }}>
              <h4 style={{ color: 'var(--warning)', marginBottom: '1rem' }}>General Suggestions</h4>
              <ul style={{ color: 'var(--text-muted)', margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {evaluation.suggestions?.map((sugg, idx) => <li key={idx}>{sugg}</li>)}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={() => { setEvaluation(null); setSidebarOpen(false); }}>
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
            {/* Dark backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSidebarOpen(false); window.speechSynthesis.cancel(); setSpeakingId(null); }}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
            />

            {/* Sliding sidebar */}
            <motion.div
              key="sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '420px', maxWidth: '95vw',
                backgroundColor: '#0f172a',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                zIndex: 50,
                overflowY: 'auto',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#c084fc', margin: 0 }}>💡 Ideal Answer</h3>
                <button
                  onClick={() => { setSidebarOpen(false); window.speechSynthesis.cancel(); setSpeakingId(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}
                >×</button>
              </div>

              {/* Question */}
              <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Interview Question</p>
                <p style={{ color: 'var(--text-light)', margin: 0, lineHeight: 1.6 }}>{sidebarItem.question}</p>
              </div>

              {/* Your Answer */}
              <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem' }}>
                <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Answer</p>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>{sidebarItem.answer || 'No answer provided.'}</p>
              </div>

              {/* Ideal Answer */}
              <div style={{ padding: '1rem', backgroundColor: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ color: '#c084fc', fontSize: '0.8rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ideal Answer — Answer Like This</p>
                  <button
                    onClick={() => playVoice(sidebarItem.idealAnswer, 'sidebar-ideal')}
                    title={speakingId === 'sidebar-ideal' ? 'Stop' : 'Listen'}
                    style={voiceBtnStyle(speakingId === 'sidebar-ideal')}
                  >
                    {speakingId === 'sidebar-ideal' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                </div>
                <p style={{ color: 'var(--text-light)', margin: 0, lineHeight: 1.7, fontSize: '1rem' }}>{sidebarItem.idealAnswer}</p>
              </div>

              {/* Key tips */}
              <div style={{ padding: '1rem', backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.5rem' }}>
                <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>What You Did Right</p>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{sidebarItem.strengths}</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem' }}>
                <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>What To Improve</p>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{sidebarItem.weaknesses}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockInterview;
