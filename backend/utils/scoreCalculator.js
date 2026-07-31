// The AI currently provides the scores, but this utility could be used 
// to calculate additional metrics or validate the AI output.

const calculateCustomScore = (skillsFound, jobKeywords) => {
  if (!skillsFound || !jobKeywords || jobKeywords.length === 0) return 0;
  
  const matchCount = skillsFound.filter(skill => 
    jobKeywords.some(keyword => keyword.toLowerCase() === skill.toLowerCase())
  ).length;

  return Math.round((matchCount / jobKeywords.length) * 100);
};

module.exports = {
  calculateCustomScore
};
