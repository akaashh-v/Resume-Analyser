import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ResumeUpload = ({ file, setFile }) => {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.docx'))) {
      setFile(f);
    } else {
      alert('Please upload a PDF or DOCX file.');
    }
  };

  const handleChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700,
        color: '#8f8f9e', textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>
        Resume File
      </label>

      <div
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `1.5px dashed ${dragging ? 'var(--primary)' : file ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '0.375rem',
          padding: '1.5rem 1rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.01)',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          type="file" ref={fileInputRef}
          onChange={handleChange}
          accept=".pdf,.docx"
          style={{ display: 'none' }}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
            >
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.825rem' }}>
                {file.name}
              </div>
              <div style={{ color: '#8f8f9e', fontSize: '0.75rem' }}>
                {(file.size / 1024).toFixed(1)} KB · Click to replace
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
            >
              <div style={{ color: '#8f8f9e', fontSize: '0.8rem', fontWeight: 600 }}>
                Drop PDF or DOCX file here
              </div>
              <div style={{ color: '#3f3f46', fontSize: '0.72rem' }}>
                or click to browse
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResumeUpload;
