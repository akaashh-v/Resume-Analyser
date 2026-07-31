import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem', textAlign: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <div className="badge badge-success" style={{ marginBottom: '1.5rem' }}>
          ✨ Powered by Gemini AI
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>
          Optimize Your Resume for <br/>
          <span className="text-gradient">Applicant Tracking Systems</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Upload your resume and the job description you're applying for. 
          Our advanced AI will analyze your fit, highlight missing keywords, 
          and provide actionable improvement suggestions.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/analyzer" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
            Analyze Resume Now
          </Link>
          <Link to="/about" className="btn btn-outline" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
            Learn How It Works
          </Link>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ marginTop: '5rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {[
          { title: 'Smart Analysis', desc: 'Identifies keyword gaps and formatting issues instantly.' },
          { title: 'ATS Score', desc: 'Get a realistic score on how well your resume parses.' },
          { title: 'Actionable Advice', desc: 'Receive concrete suggestions to improve your chances.' }
        ].map((feature, idx) => (
          <div key={idx} className="glass" style={{ padding: '2rem', borderRadius: '1rem', flex: '1 1 250px', maxWidth: '300px', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>{feature.title}</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;
