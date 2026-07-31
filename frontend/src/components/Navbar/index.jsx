import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText } from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4rem'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <motion.div whileHover={{ rotate: 10 }}>
            <FiFileText size={24} color="var(--primary)" />
          </motion.div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }} className="text-gradient">
            AI Resume Analyzer
          </span>
        </Link>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {[
            { path: '/', label: 'Home' },
            { path: '/analyzer', label: 'Analyzer' },
            { path: '/about', label: 'About' },
            { path: '/contact', label: 'Contact' }
          ].map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive(item.path) ? 'var(--text-light)' : 'var(--text-muted)',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-light)'}
              onMouseLeave={(e) => e.target.style.color = isActive(item.path) ? 'var(--text-light)' : 'var(--text-muted)'}
            >
              {item.label}
              {isActive(item.path) && (
                <motion.div
                  layoutId="navbar-indicator"
                  style={{
                    height: '2px',
                    background: 'var(--primary)',
                    marginTop: '4px',
                    borderRadius: '2px'
                  }}
                />
              )}
            </Link>
          ))}
          <Link to="/analyzer" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
