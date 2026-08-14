import React, { useState } from 'react';
import { scrapeJobUrl } from '../../services/api';

const JobDescriptionInput = ({ jobDescription, setJobDescription, jobTitle, setJobTitle, companyName, setCompanyName }) => {
  const [focused, setFocused] = useState(false);
  const [url, setUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const charCount = jobDescription?.length || 0;

  const handleScrape = async () => {
    if (!url.trim()) return;
    setScraping(true);
    setScrapeError('');
    try {
      const data = await scrapeJobUrl(url);
      if (data.jobTitle) setJobTitle(data.jobTitle);
      if (data.companyName) setCompanyName(data.companyName);
      if (data.jobDescription) setJobDescription(data.jobDescription);
      setUrl('');
    } catch (err) {
      setScrapeError(err.error || 'Failed to fetch job details');
    } finally {
      setScraping(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    borderRadius: '0.375rem',
    border: '1.5px solid rgba(255,255,255,0.06)',
    background: 'rgba(0,0,0,0.15)',
    color: '#f4f4f5',
    fontFamily: 'inherit',
    fontSize: '0.825rem',
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
    boxSizing: 'border-box',
    marginBottom: '1rem'
  };

  const labelStyle = {
    fontSize: '0.75rem', fontWeight: 700,
    color: '#8f8f9e', textTransform: 'uppercase', letterSpacing: '0.05em',
    marginBottom: '0.5rem', display: 'block'
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.375rem' }}>
        <label style={{...labelStyle, color: '#10b981'}}>Autofill from URL</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste LinkedIn or Indeed job URL..."
            style={{...inputStyle, marginBottom: 0, flex: 1}}
            disabled={scraping}
          />
          <button 
            onClick={handleScrape}
            disabled={scraping || !url.trim()}
            style={{
              background: 'var(--primary)', color: '#fff', border: 'none', padding: '0 1rem', 
              borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.8rem', cursor: scraping || !url.trim() ? 'not-allowed' : 'pointer',
              opacity: scraping || !url.trim() ? 0.6 : 1
            }}
          >
            {scraping ? 'Extracting...' : 'Autofill'}
          </button>
        </div>
        {scrapeError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>{scrapeError}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Job Title</label>
      <input 
        type="text"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        placeholder="e.g. Senior Frontend Developer"
        style={inputStyle}
      />
        </div>
        <div>
          <label style={labelStyle}>Company Name</label>
          <input 
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Google, Stripe"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>
          Job Description
        </label>
        {charCount > 0 && (
          <span style={{ fontSize: '0.7rem', color: '#8f8f9e' }}>
            {charCount} chars
          </span>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Paste requirements, role details, or target description..."
          rows={6}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '0.375rem',
            border: `1.5px solid ${focused ? 'var(--primary)' : 'rgba(255,255,255,0.06)'}`,
            background: 'rgba(0,0,0,0.15)',
            color: '#f4f4f5',
            fontFamily: 'inherit',
            fontSize: '0.825rem',
            lineHeight: '1.6',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.15s, background 0.15s',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
};

export default JobDescriptionInput;
