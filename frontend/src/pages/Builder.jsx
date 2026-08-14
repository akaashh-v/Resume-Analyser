import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResumeBuilder from '../components/ResumeBuilder';
import { parseResumeFile } from '../services/api';

const BuilderPage = () => {
  const location = useLocation();
  const [importedData, setImportedData] = useState(location.state?.importedData || null);
  const [builderKey, setBuilderKey] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const parsedData = await parseResumeFile(formData);
      setImportedData(parsedData);
      setBuilderKey(Date.now()); // force component remount with new data
    } catch (err) {
      console.error('Error parsing resume:', err);
      alert('Failed to parse resume. Please try again.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#fff' }}>
            Resume Builder
          </h1>
          <p style={{ color: '#8f8f9e', fontSize: '0.8rem', margin: '0.15rem 0 0' }}>
            Design, format, and customize your resume template live
          </p>
        </div>
        
        <div>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <button 
            className="btn btn-outline" 
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
          >
            {loading ? 'Parsing...' : 'Clone from PDF'}
          </button>
        </div>
      </div>

      <ResumeBuilder key={builderKey} importedData={importedData} defaultTemplate={location.state?.defaultTemplate || 'classic'} onBack={() => window.history.back()} />
    </div>
  );
};

export default BuilderPage;
