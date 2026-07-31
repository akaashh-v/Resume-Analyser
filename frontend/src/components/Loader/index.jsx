import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '4rem 0',
      gap: '2rem'
    }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <motion.span 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '4px solid transparent',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            boxSizing: 'border-box'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '4px solid transparent',
            borderBottomColor: 'var(--accent)',
            borderRadius: '50%',
            boxSizing: 'border-box',
            opacity: 0.8
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      
      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}
      >
        Analyzing resume against job description...
      </motion.p>
    </div>
  );
};

export default Loader;
