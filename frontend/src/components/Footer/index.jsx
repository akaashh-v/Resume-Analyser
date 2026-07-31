import React from 'react';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '3rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='var(--text-light)'} onMouseOut={e => e.target.style.color='var(--text-muted)'}><FiGithub size={20} /></a>
          <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='var(--text-light)'} onMouseOut={e => e.target.style.color='var(--text-muted)'}><FiTwitter size={20} /></a>
          <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='var(--text-light)'} onMouseOut={e => e.target.style.color='var(--text-muted)'}><FiLinkedin size={20} /></a>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
          &copy; {new Date().getFullYear()} AI Resume Analyzer. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
