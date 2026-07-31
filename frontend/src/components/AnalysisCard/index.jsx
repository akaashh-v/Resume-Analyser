import React from 'react';
import { motion } from 'framer-motion';

const AnalysisCard = ({ title, items, type = 'default' }) => {
  if (!items || items.length === 0) return null;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return { borderColor: 'rgba(16, 185, 129, 0.3)', iconColor: 'var(--success)', bg: 'rgba(16, 185, 129, 0.05)' };
      case 'warning':
        return { borderColor: 'rgba(245, 158, 11, 0.3)', iconColor: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.05)' };
      case 'error':
        return { borderColor: 'rgba(239, 68, 68, 0.3)', iconColor: 'var(--error)', bg: 'rgba(239, 68, 68, 0.05)' };
      default:
        return { borderColor: 'rgba(255, 255, 255, 0.1)', iconColor: 'var(--primary)', bg: 'transparent' };
    }
  };

  const { borderColor, iconColor, bg } = getStyles();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass"
      style={{ 
        padding: '1.5rem', 
        borderRadius: '1rem', 
        borderLeft: `4px solid ${borderColor}`,
        background: bg || 'rgba(30, 41, 59, 0.7)'
      }}
    >
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: iconColor, fontSize: '1.25rem' }}>•</span>
        {title}
      </h3>
      
      <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
        {items.map((item, idx) => (
          <li key={idx} style={{ lineHeight: 1.5 }}>{item}</li>
        ))}
      </ul>
    </motion.div>
  );
};

export default AnalysisCard;
