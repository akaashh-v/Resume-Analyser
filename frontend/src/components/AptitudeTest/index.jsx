import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AptitudeTest = ({ questions, onRestart }) => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const handleSelectOption = (qIndex, option) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = option;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    return score;
  };

  const handleSubmit = () => {
    if (answers.includes(null)) {
      if (!window.confirm("You have unanswered questions. Are you sure you want to submit?")) {
        return;
      }
    }
    setSubmitted(true);
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div style={{ position: 'relative', marginTop: '2rem' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Aptitude Test
          </h3>
          {submitted && (
            <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              Score: {calculateScore()} / {questions.length}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {questions.map((q, index) => {
            const isCorrect = answers[index] === q.correctAnswer;
            
            return (
              <div key={index} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '1.25rem', borderRadius: '0.25rem' }}>
                <p style={{ color: '#f4f4f5', fontSize: '1rem', lineHeight: '1.6', margin: '0 0 1rem 0', fontWeight: 500 }}>
                  {index + 1}. {q.question}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, optIndex) => {
                    const isSelected = answers[index] === opt;
                    let bg = 'rgba(255,255,255,0.03)';
                    let border = '1px solid rgba(255,255,255,0.05)';
                    
                    if (submitted) {
                      if (opt === q.correctAnswer) {
                        bg = 'rgba(16, 185, 129, 0.15)'; // Success
                        border = '1px solid rgba(16, 185, 129, 0.4)';
                      } else if (isSelected) {
                        bg = 'rgba(239, 68, 68, 0.15)'; // Error
                        border = '1px solid rgba(239, 68, 68, 0.4)';
                      }
                    } else if (isSelected) {
                      bg = 'rgba(124, 58, 237, 0.15)'; // Primary
                      border = '1px solid rgba(124, 58, 237, 0.4)';
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(index, opt)}
                        style={{
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.25rem',
                          background: bg,
                          border: border,
                          color: '#e4e4e7',
                          cursor: submitted ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '0.9rem'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      borderRadius: '0.25rem',
                      backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                      borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                      color: '#d4d4d8',
                      fontSize: '0.85rem',
                      lineHeight: '1.5'
                    }}
                  >
                    <strong>Explanation:</strong> {q.explanation}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {!submitted ? (
            <button
              onClick={handleSubmit}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={onRestart}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
                padding: '0.75rem 2rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Generate New Test
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AptitudeTest;
