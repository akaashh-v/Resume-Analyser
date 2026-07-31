import React, { useRef } from 'react';
import { FiUploadCloud, FiFile } from 'react-icons/fi';

const ResumeUpload = ({ file, setFile }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.type === 'application/pdf' || selected.name.endsWith('.docx'))) {
      setFile(selected);
    } else {
      alert('Please upload a PDF or DOCX file.');
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-light)' }}>
        Upload Resume (PDF/DOCX)
      </label>
      
      <div 
        onClick={() => fileInputRef.current.click()}
        style={{
          border: '2px dashed rgba(255,255,255,0.2)',
          borderRadius: '1rem',
          padding: '2.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={e => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf,.docx" 
          style={{ display: 'none' }} 
        />
        
        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <FiFile size={48} color="var(--primary)" />
            <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>{file.name}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click to change file</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <FiUploadCloud size={48} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-muted)' }}>Drag & drop your resume here or click to browse</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
