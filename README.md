# ResumeAnalyzer 🚀

ResumeAnalyzer is an AI-powered platform designed to bridge the gap between your resume and your dream job. By leveraging advanced generative AI (Google Gemini), it intelligently compares your resume against target job descriptions to give you actionable insights, match scores, and interview preparation tools.

## ✨ Features

- **🎯 Job Match Scoring**: Instantly see how well your resume aligns with a job description.
- **🔍 Skill Gap Analysis**: Discover missing skills and keywords required by the employer.
- **🤖 AI Mock Interviews**: Generate tailored interview questions and scenarios based on your specific resume and the job you want.
- **📝 Resume Builder & Optimizer**: Enhance your bullet points and rewrite sections to better target specific roles.
- **🌐 Chrome Extension**: A built-in "Mini-Screener" extension that lets you extract job details from LinkedIn or Indeed, upload your PDF resume, and get an instant match score without leaving the page!

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Framer Motion (for animations)
- **Backend**: Node.js, Express.js
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Browser Extension**: Chrome Manifest V3 (Vanilla JS, HTML, CSS)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- A Google Gemini API Key

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`.

### 3. Chrome Extension Setup

To use the 1-click LinkedIn/Indeed scraper and mini-screener:
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** on in the top right corner.
3. Click **Load unpacked** in the top left.
4. Select the `extension` folder located inside this repository.
5. Pin the extension to your toolbar. Now, whenever you are on a job posting, click the extension, upload your resume, and get an instant score!

## 📂 Project Structure

- `/frontend`: The React application UI and context state.
- `/backend`: The Express server handling AI prompts, PDF parsing, and routing.
- `/extension`: The Chrome extension files (`manifest.json`, `popup.html`, `content.js`, etc.).

## 📜 License

MIT License.
