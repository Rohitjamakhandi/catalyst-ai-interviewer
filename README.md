# Catalyst AI - Skill Assessment & Personalized Learning Plan

Catalyst AI is an intelligent, full-stack web application designed to evaluate a candidate's actual proficiency in required job skills using a conversational AI interviewer. After the interview, it provides a comprehensive gap analysis and generates a personalized learning roadmap.

---

## ⚡ Technology Stack

### Core Architecture
*   **Framework:** Next.js 14 (App Router)
*   **UI Library:** React 19
*   **Runtime:** Node.js

### Artificial Intelligence
*   **AI Engine:** Google Generative AI (`@google/generative-ai`)
*   **Models Used:** `gemini-flash-latest` (fast, free-tier fallback), `gemini-pro-latest` (high accuracy).

### Frontend & Design
*   **Styling:** CSS Modules (`*.module.css`) and global CSS variables for dynamic theming.
*   **Aesthetics:** Custom Glassmorphism UI, Dark Mode optimized, dynamic micro-animations.
*   **Data Visualization:** Recharts (Radar charts for Skill Gap Analysis).

### Utilities
*   **Document Parsing:** `pdf-parse` (Server-side extraction of text from Resume PDFs).

---

## 📁 Folder Structure

```text
catalyst-app/
├── app/                        # Next.js 14 App Router Directory
│   ├── api/                    # Secure Server-Side Backend Routes
│   │   ├── chat/               # Handles the conversational AI interview
│   │   ├── learning-plan/      # Generates the personalized 8-week roadmap
│   │   └── parse-documents/    # Extracts text from PDFs and maps skills
│   ├── assess/                 # Main Dashboard page layout
│   ├── globals.css             # Core design system (colors, glassmorphism)
│   ├── layout.js               # Global HTML structure
│   └── page.js                 # Landing page
├── components/                 # Reusable React UI Components
│   ├── ChatInterface.js        # The AI Interviewer conversational UI
│   ├── GapAnalysis.js          # Renders the Recharts Radar graph
│   ├── LearningPlan.js         # The interactive 8-week learning roadmap
│   ├── SkillMatrix.js          # Displays the initial Surface Match analysis
│   └── UploadPanel.js          # Drag-and-drop file uploader for JD and Resume
├── lib/                        # Shared Utilities and Configurations
│   ├── gemini.js               # Centralized Google AI SDK setup & Prompts
│   └── skillParser.js          # Logic to extract 'SKILL_ASSESSED' tags from chat
├── public/                     # Static assets (images, icons, sample resumes)
├── .env.local                  # Environment variables (GEMINI_API_KEY)
└── next.config.mjs             # Next.js configuration (Body size limits)
```

---

## 🚀 How to Run Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Make sure you have a `.env.local` file in the root directory with your Google AI Studio API Key:
   ```env
   GEMINI_API_KEY=your_google_api_key_here
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
