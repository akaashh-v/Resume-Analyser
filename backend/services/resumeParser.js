const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

const extractText = async (fileBuffer, originalname) => {
  const ext = path.extname(originalname).toLowerCase();

  try {
    if (ext === '.pdf') {
      const data = await pdfParse(fileBuffer);
      return data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error('Failed to parse the resume document');
  }
};

module.exports = {
  extractText
};
