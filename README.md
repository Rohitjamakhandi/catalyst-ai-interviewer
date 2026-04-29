# ⚡ Catalyst AI - Interactive Interviewer or 
Assessment& Skill Analyzer

Catalyst AI is a next-generation, full-stack web application designed to evaluate a candidate's actual proficiency in required job skills using **Maya, a real-time conversational AI interviewer or assessment**. 

Instead of simple text-based quizzes, candidates interact via voice or text with a fully animated, lip-syncing D-ID video avatar. After the assessment, Catalyst AI provides a comprehensive radar-chart gap analysis, an overall performance score, and generates a personalized week-by-week learning roadmap completely populated with curated YouTube tutorials.

---

## ✨ Key Features
* **Real-Time Video Avatar:** Powered by D-ID, "Maya" conducts the interview via a WebRTC stream, offering incredibly low-latency video and audio responses.
* **Intelligent Skill Extraction:** Automatically parses PDF resumes and Job Descriptions to map out exact required skills.
* **Adaptive AI Conversations:** Uses OpenRouter (Llama 3.3 / Gemini) to dynamically ask scenario-based questions based on the candidate's specific background.
* **Voice-to-Text Support:** Candidates can answer questions using their microphone.
* **Comprehensive Gap Analysis:** Visualizes assessed skill levels vs. required skill levels using Recharts.
* **Actionable Learning Roadmap:** Automatically curates a customized multi-week learning plan, complete with direct YouTube tutorial links to fill identified skill gaps.

---

## 🛠 Technology Stack

### Core Architecture
*   **Framework:** Next.js 14 (App Router)
*   **UI Library:** React 19
*   **Runtime:** Node.js

### Artificial Intelligence & Integrations
*   **AI Engine:** OpenRouter API (`meta-llama/llama-3.3-70b-instruct`)
*   **Real-Time Avatar:** D-ID Streams API (WebRTC)
*   **Speech Recognition:** Web Speech API (Browser native)

### Frontend & Design
*   **Styling:** CSS Modules (`*.module.css`) with custom Glassmorphism UI and dynamic micro-animations.
*   **Data Visualization:** Recharts (Radar charts).

### Utilities
*   **Document Parsing:** `pdf-parse` (Server-side PDF extraction).

---

## 📁 Folder Structure

```text
catalyst-app/
├── app/                        # Next.js 14 App Router Directory
│   ├── api/                    # Secure Server-Side Backend Routes
│   │   ├── chat/               # Handles the conversational AI interview
│   │   ├── did/                # D-ID WebRTC API Routes (create-stream, talk, ice, sdp)
│   │   ├── learning-plan/      # Generates the personalized roadmap w/ YouTube links
│   │   └── parse-documents/    # Extracts text from PDFs and maps skills
│   ├── assess/                 # Main Dashboard page layout
│   ├── globals.css             # Core design system
│   └── page.js                 # Landing page
├── components/                 # Reusable React UI Components
│   ├── ChatInterface.js        # The conversational chat UI & Voice Input
│   ├── InterviewAvatar.js      # Manages the WebRTC D-ID Video Stream
│   ├── GapAnalysis.js          # Renders the Recharts Radar graph
│   ├── LearningPlan.js         # The interactive learning roadmap
│   ├── SkillMatrix.js          # Displays the initial Document Match analysis
│   └── UploadPanel.js          # Drag-and-drop file uploader
├── lib/                        # Shared Utilities and Configurations
│   ├── gemini.js               # Centralized AI Prompts & OpenRouter setup
│   └── skillParser.js          # Logic to extract AI assessment tags
└── .env.local                  # Environment variables
```

---

## 🚀 How to Run Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory with your API keys:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   DID_API_KEY=your_did_api_key_here
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
