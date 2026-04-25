'use client';
import { useState, useRef } from 'react';
import styles from './UploadPanel.module.css';

const SAMPLE_JD = `We are looking for a Senior React Developer to join our team.

Requirements:
- 3+ years of experience with React.js and modern JavaScript (ES6+)
- Strong proficiency in TypeScript
- Experience with Node.js and REST APIs
- Familiarity with PostgreSQL or MongoDB
- Knowledge of Docker and CI/CD pipelines
- Experience with AWS or similar cloud platforms
- Strong understanding of Git and version control
- Excellent problem-solving and communication skills
- Experience with agile/scrum methodologies`;

const SAMPLE_RESUME = `John Doe | john@email.com | github.com/johndoe

EXPERIENCE
Frontend Developer – TechCorp (2021–Present)
- Built React dashboards using hooks, Context API, and Redux
- Worked with REST APIs and JSON data
- Used Git for version control in a team of 8

Junior Developer – StartupX (2020–2021)
- Basic JavaScript and HTML/CSS development

SKILLS
React, JavaScript, HTML, CSS, Git, some Node.js experience

EDUCATION
B.Tech Computer Science, 2020`;

export default function UploadPanel({ onComplete }) {
  const [jd, setJd]                 = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [tab, setTab]               = useState('paste'); // paste | upload
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    if (file.type === 'application/pdf') {
      setResumeFile(file);
      setResumeText('');
    } else {
      const reader = new FileReader();
      reader.onload = (e) => { setResumeText(e.target.result); setResumeFile(null); };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!jd.trim()) return setError('Please paste a Job Description.');
    if (!resumeText.trim() && !resumeFile) return setError('Please provide your resume.');
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('jd', jd);
      if (resumeFile) fd.append('resume', resumeFile);
      else fd.append('resumeText', resumeText);
      const res  = await fetch('/api/parse-documents', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onComplete(json.data);
    } catch (e) {
      setError(e.message || 'Failed to analyse documents. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1>Upload Your Documents</h1>
        <p>Paste or upload your Job Description and Resume to begin.</p>
      </div>

      <div className={styles.panels}>
        {/* JD Panel */}
        <div className={styles.panel + ' glass'}>
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}>📋</span>
            <div>
              <h3>Job Description</h3>
              <p>Paste the full job description here</p>
            </div>
            <button className="btn btn-ghost" style={{marginLeft:'auto',fontSize:'12px',padding:'6px 12px'}}
              onClick={() => setJd(SAMPLE_JD)}>Use Sample</button>
          </div>
          <textarea
            id="jd-input"
            className="input"
            style={{minHeight:'280px',marginTop:'16px',fontSize:'13px',lineHeight:'1.7'}}
            placeholder="We are looking for a Senior React Developer...&#10;&#10;Requirements:&#10;- 3+ years React experience&#10;- TypeScript proficiency..."
            value={jd}
            onChange={e => setJd(e.target.value)}
          />
          <div className={styles.charCount}>{jd.length} characters</div>
        </div>

        {/* Resume Panel */}
        <div className={styles.panel + ' glass'}>
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}>👤</span>
            <div>
              <h3>Your Resume</h3>
              <p>PDF upload or paste plain text</p>
            </div>
            <button className="btn btn-ghost" style={{marginLeft:'auto',fontSize:'12px',padding:'6px 12px'}}
              onClick={() => { setResumeText(SAMPLE_RESUME); setResumeFile(null); setTab('paste'); }}>Use Sample</button>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={styles.tab + (tab==='paste' ? ' '+styles.tabActive : '')} onClick={() => setTab('paste')}>Paste Text</button>
            <button className={styles.tab + (tab==='upload' ? ' '+styles.tabActive : '')} onClick={() => setTab('upload')}>Upload PDF</button>
          </div>

          {tab === 'paste' ? (
            <>
              <textarea
                id="resume-text-input"
                className="input"
                style={{minHeight:'232px',fontSize:'13px',lineHeight:'1.7'}}
                placeholder="John Doe | john@email.com&#10;&#10;EXPERIENCE&#10;Frontend Developer – TechCorp (2021–Present)&#10;..."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
              />
              <div className={styles.charCount}>{resumeText.length} characters</div>
            </>
          ) : (
            <div
              id="resume-drop-zone"
              className={styles.dropZone + (dragging ? ' '+styles.dropZoneDrag : '') + (resumeFile ? ' '+styles.dropZoneDone : '')}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt" style={{display:'none'}}
                onChange={e => handleFile(e.target.files[0])} />
              {resumeFile ? (
                <>
                  <span className={styles.dropIcon}>✅</span>
                  <p style={{color:'var(--success)',fontWeight:600}}>{resumeFile.name}</p>
                  <p style={{fontSize:'12px',color:'var(--text-muted)'}}>
                    {(resumeFile.size / 1024).toFixed(1)} KB · Click to replace
                  </p>
                </>
              ) : (
                <>
                  <span className={styles.dropIcon}>📎</span>
                  <p style={{fontWeight:600}}>Drop PDF here or click to browse</p>
                  <p style={{fontSize:'12px',color:'var(--text-muted)'}}>Supports PDF and TXT files</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>⚠️ {error}</div>}

      <div className={styles.actions}>
        <button
          id="analyse-btn"
          className="btn btn-primary"
          style={{fontSize:'15px',padding:'14px 36px'}}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <><span className="animate-spin" style={{display:'inline-block'}}>⟳</span> Analysing…</>
          ) : '🔍 Analyse Documents →'}
        </button>
        {loading && (
          <p style={{color:'var(--text-muted)',fontSize:'13px',marginTop:'12px',textAlign:'center'}}>
            AI is reading your documents and extracting skills…
          </p>
        )}
      </div>
    </div>
  );
}
