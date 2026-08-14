import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Analyzer from './pages/Analyzer';
import Builder from './pages/Builder';
import LinkedInOptimizer from './pages/LinkedInOptimizer';
import CoverLetterBuilder from './pages/CoverLetterBuilder';
import CoachHub from './pages/CoachHub';
import About from './pages/About';
import Contact from './pages/Contact';
import { AnalyzerProvider } from './context/AnalyzerContext';

function App() {
  return (
    <AnalyzerProvider>
      <Router>
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analyzer" element={<Analyzer />} />
              <Route path="/builder" element={<Builder />} />
              <Route path="/linkedin-optimizer" element={<LinkedInOptimizer />} />
              <Route path="/cover-letter" element={<CoverLetterBuilder />} />
              <Route path="/coaching" element={<CoachHub />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AnalyzerProvider>
  );
}

export default App;

