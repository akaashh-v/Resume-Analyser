import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: '🎯',
    title: 'ATS Score',
    desc: 'Get an instant compatibility score that predicts how well your resume passes automated screening.',
    color: '#6366f1',
  },
  {
    icon: '⚡',
    title: 'Skill Gap Analysis',
    desc: "Instantly see which skills you have, which you're missing, and what to add next.",
    color: '#22d3ee',
  },
  {
    icon: '💡',
    title: 'AI Suggestions',
    desc: 'Gemini-powered recommendations tailored specifically to the job description you provide.',
    color: '#a78bfa',
  },
  {
    icon: '🎤',
    title: 'Mock Interview',
    desc: 'Practice with AI-generated interview questions and get detailed feedback on your answers.',
    color: '#10b981',
  },
];

const STATS = [
  { value: '98%', label: 'ATS Accuracy' },
  { value: '3s',  label: 'Analysis Time' },
  { value: '12+', label: 'Score Categories' },
  { value: '∞',   label: 'Free Analyses' },
];

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Hero ── */}
      <section style={{ paddingTop: '6rem', paddingBottom: '5rem', textAlign: 'center', position: 'relative' }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 1rem', borderRadius: '9999px',
                border: '1px solid rgba(99,102,241,0.35)',
                background: 'rgba(99,102,241,0.08)',
                fontSize: '0.8rem', fontWeight: 600, color: '#818cf8'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', display: 'inline-block', boxShadow: '0 0 8px #6366f1' }} />
                Powered by Gemini AI
              </div>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
              color: '#f1f5f9'
            }}>
              Land your dream job with{' '}
              <span className="text-gradient">AI-powered</span>
              <br />resume analysis
            </h1>

            <p style={{
              color: '#64748b', fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              maxWidth: '560px', margin: '0 auto 2.5rem',
              lineHeight: 1.7
            }}>
              Upload your resume and job description. Get an instant ATS score, skill gap report,
              keyword analysis, and personalized improvement suggestions — all in seconds.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/analyzer"
                className="btn btn-primary"
                style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
              >
                ⚡ Analyze My Resume
              </Link>
              <Link
                to="/about"
                className="btn btn-ghost"
                style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
              >
                How it works →
              </Link>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
              gap: '0', marginTop: '4.5rem',
              borderRadius: '1rem', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
              maxWidth: '640px', margin: '4.5rem auto 0'
            }}
          >
            {STATS.map((s, i) => (
              <div key={i} style={{
                flex: '1 1 120px', padding: '1.5rem 1rem', textAlign: 'center',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.75rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', marginBottom: '0.25rem'
                }}>
                  {s.value}
                </div>
                <div style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800, letterSpacing: '-0.025em', color: '#f1f5f9', marginBottom: '0.75rem'
            }}>
              Everything you need to
              <span className="text-gradient"> get hired faster</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '460px', margin: '0 auto' }}>
              A complete resume intelligence platform built on cutting-edge AI.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  padding: '1.75rem',
                  borderRadius: '1.25rem',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(13,17,23,0.6)',
                  transition: 'border-color 0.3s, transform 0.3s',
                  cursor: 'default'
                }}
                whileHover={{ y: -4, borderColor: `${f.color}40` }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: `${f.color}18`, border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', marginBottom: '1.1rem'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem' }}>
                  {f.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            style={{ textAlign: 'center', marginTop: '3rem' }}
          >
            <Link
              to="/analyzer"
              className="btn btn-primary"
              style={{ fontSize: '1rem', padding: '0.9rem 2.25rem' }}
            >
              Get Started — It's Free →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
