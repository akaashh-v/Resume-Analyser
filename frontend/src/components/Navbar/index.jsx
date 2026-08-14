import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileAlt, FaCloudUploadAlt, FaCheckCircle, FaMagic, FaRobot, FaBrain, FaEnvelope, FaRegFileAlt, FaCog } from 'react-icons/fa';
import { updateApiKey } from '../../services/api';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];



const RESUME_TOOLS = [
  { path: '/cover-letter', label: 'Cover Letter Builder', description: 'Create compelling cover letters', icon: FaEnvelope },
  { path: '/builder', state: { defaultTemplate: 'one-pager' }, label: 'One-Pager Resume', description: 'Single-page resume format', icon: FaRegFileAlt }
];

const Navbar = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resumeDropdownOpen, setResumeDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSaveStatus, setApiSaveStatus] = useState('');

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    try {
      setApiSaveStatus('Saving...');
      await updateApiKey(apiKeyInput.trim());
      setApiSaveStatus('Saved!');
      setTimeout(() => {
        setApiSaveStatus('');
        setSettingsDropdownOpen(false);
        setApiKeyInput('');
      }, 1500);
    } catch (e) {
      setApiSaveStatus('Error saving key');
    }
  };
  const isActive = (path) => location.pathname === path;
  const isResumeToolActive = RESUME_TOOLS.some(tool => location.pathname === tool.path);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      background: '#09090b',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '3.5rem' }}>

        {/* Logo (No symbols/emojis) */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800,
            letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff'
          }}>
            Resume<span style={{ color: 'var(--primary)' }}>AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/analyzer" style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isActive('/analyzer') ? 'var(--primary)' : '#8f8f9e',
            textDecoration: 'none'
          }}>
            Resume Analyzer
          </Link>
          <Link to="/builder" style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isActive('/builder') ? 'var(--primary)' : '#8f8f9e',
            textDecoration: 'none'
          }}>
            Resume Builder
          </Link>

          <Link to="/coaching" style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isActive('/coaching') ? 'var(--primary)' : '#8f8f9e',
            textDecoration: 'none'
          }}>
            Coaching
          </Link>
          
          {/* Resume Tools Dropdown (Mega Menu) */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setResumeDropdownOpen(true)}
            onMouseLeave={() => setResumeDropdownOpen(false)}
          >
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isResumeToolActive ? 'var(--primary)' : '#8f8f9e',
              cursor: 'pointer',
              padding: '1rem 0'
            }}>
              Resume Tools ▾
            </div>
            
            <AnimatePresence>
              {resumeDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    minWidth: '600px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                  }}
                >
                  {RESUME_TOOLS.map((tool, idx) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={idx}
                        to={tool.path}
                        state={tool.state || {}}
                        onClick={() => setResumeDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          color: '#d4d4d8',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '0.6rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          fontSize: '1.2rem'
                        }}>
                          <Icon />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{tool.label}</span>
                            {tool.badge && (
                              <span style={{
                                background: tool.badgeColor,
                                color: 'white',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '0.1rem 0.4rem',
                                borderRadius: '12px',
                                textTransform: 'uppercase'
                              }}>
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{tool.description}</div>
                        </div>
                      </Link>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/linkedin-optimizer" style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isActive('/linkedin-optimizer') ? 'var(--primary)' : '#8f8f9e',
            textDecoration: 'none'
          }}>
            LinkedIn Optimizer
          </Link>

          {/* API Settings Dropdown */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setSettingsDropdownOpen(true)}
            onMouseLeave={() => setSettingsDropdownOpen(false)}
          >
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: settingsDropdownOpen ? 'var(--primary)' : '#8f8f9e',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'color 0.2s',
                padding: '0.5rem'
              }}
            >
              <FaCog /> API Settings
            </button>

            <AnimatePresence>
              {settingsDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    minWidth: '280px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                    zIndex: 100
                  }}
                >
                  <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Gemini API Key
                  </div>
                  <div style={{ color: '#a1a1aa', fontSize: '0.7rem', marginBottom: '1rem' }}>
                    Update your API key on the fly. This saves directly to your .env file.
                  </div>
                  <input
                    type="password"
                    placeholder="Enter new API key..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(0,0,0,0.2)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      marginBottom: '0.75rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: apiSaveStatus.includes('Error') ? '#ef4444' : '#10b981' }}>
                      {apiSaveStatus}
                    </span>
                    <button
                      onClick={handleSaveApiKey}
                      disabled={!apiKeyInput.trim() || apiSaveStatus === 'Saving...'}
                      style={{
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: (!apiKeyInput.trim() || apiSaveStatus === 'Saving...') ? 'not-allowed' : 'pointer',
                        opacity: (!apiKeyInput.trim() || apiSaveStatus === 'Saving...') ? 0.6 : 1
                      }}
                    >
                      Save Key
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
