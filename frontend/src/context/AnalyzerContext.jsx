import React, { createContext, useState, useContext } from 'react';

const AnalyzerContext = createContext();

export const useAnalyzer = () => useContext(AnalyzerContext);

export const AnalyzerProvider = ({ children }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [result, setResult] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [activeTab, setActiveTab] = useState('score');
  
  return (
    <AnalyzerContext.Provider value={{
      file, setFile,
      jobDescription, setJobDescription,
      jobTitle, setJobTitle,
      companyName, setCompanyName,
      result, setResult,
      interviewQuestions, setInterviewQuestions,
      activeTab, setActiveTab
    }}>
      {children}
    </AnalyzerContext.Provider>
  );
};
