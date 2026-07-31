import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', maxWidth: '800px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>About AI Resume Analyzer</h1>
        
        <div className="glass" style={{ padding: '2.5rem', borderRadius: '1rem' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>How it Works</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            The AI Resume Analyzer leverages cutting-edge Large Language Models to simulate 
            how a modern Applicant Tracking System (ATS) and human recruiter would evaluate your resume.
            By comparing your qualifications directly against the job description, it identifies crucial 
            gaps in your presentation.
          </p>

          <h3 style={{ marginBottom: '1rem' }}>The Process:</h3>
          <ol style={{ color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong>Upload:</strong> You provide your resume (PDF/DOCX) and the target job description.</li>
            <li><strong>Parse:</strong> Our backend extracts the text data accurately from your document.</li>
            <li><strong>Analyze:</strong> The AI model evaluates semantic matches, keyword density, and overall structure.</li>
            <li><strong>Report:</strong> You receive a detailed breakdown of scores, strengths, weaknesses, and actionable suggestions.</li>
          </ol>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
