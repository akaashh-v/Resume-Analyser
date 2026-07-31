import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ value, label, color = 'var(--primary)' }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-light)' }}>{label}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color }}>{value}%</span>
      </div>
      <div style={{ 
        width: '100%', 
        height: '8px', 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ 
            height: '100%', 
            backgroundColor: color,
            borderRadius: '4px'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
