import React from 'react';

const JobDescriptionInput = ({ jobDescription, setJobDescription }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-light)' }}>
        Job Description
      </label>
      <textarea 
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here..."
        rows="8"
        style={{
          width: '100%',
          padding: '1.25rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.2)',
          color: 'white',
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  );
};

export default JobDescriptionInput;
