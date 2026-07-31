import React from 'react';
import { motion } from 'framer-motion';
import ProgressBar from '../ProgressBar';

const ScoreCard = ({ scores }) => {
  if (!scores) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const scoreLabels = {
    overall: 'Overall Score',
    ats: 'ATS Compatibility',
    jobMatch: 'Job Match',
    skills: 'Technical Skills',
    experience: 'Work Experience',
    projects: 'Projects Relevance',
    education: 'Education',
    formatting: 'Formatting',
    grammar: 'Grammar & Readability'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass" 
      style={{ padding: '2rem', borderRadius: '1rem', height: '100%' }}
    >
      <h3 style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>Comprehensive Scores</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Object.entries(scores).map(([key, value]) => {
          // ensure we only map keys we know how to label safely
          if (!scoreLabels[key]) return null;
          return (
            <ProgressBar 
              key={key}
              label={scoreLabels[key]} 
              value={value || 0} 
              color={getScoreColor(value || 0)} 
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default ScoreCard;
