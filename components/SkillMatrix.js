'use client';
import styles from './SkillMatrix.module.css';

const IMPORTANCE_COLOR = { Critical: 'badge-red', Important: 'badge-yellow', 'Nice-to-have': 'badge-purple' };
const LEVEL_COLOR = { Beginner: '#8b8fa8', Intermediate: '#6c63ff', Advanced: '#ffb347', Expert: '#00d4aa' };

export default function SkillMatrix({ data, onStart }) {
  const { jobTitle, company, requiredSkills = [], candidateName, candidateSkills = [], overlapSkills = [], missingSkills = [] } = data;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <div className={styles.meta}>
            {company && <span className="badge badge-purple">{company}</span>}
            <span className="badge badge-green">Skills Extracted ✓</span>
          </div>
          <h1>Skill Analysis for <span className="grad-text">{jobTitle}</span></h1>
          {candidateName && <p>Candidate: <strong>{candidateName}</strong></p>}
        </div>
      </div>

      {/* Overview cards */}
      <div className={styles.overviewCards}>
        <div className={styles.oCard + ' glass'}>
          <span className={styles.oNum} style={{color:'var(--accent)'}}>{requiredSkills.length}</span>
          <span className={styles.oLabel}>Required Skills</span>
        </div>
        <div className={styles.oCard + ' glass'}>
          <span className={styles.oNum} style={{color:'var(--success)'}}>{overlapSkills.length}</span>
          <span className={styles.oLabel}>Skills Matched</span>
        </div>
        <div className={styles.oCard + ' glass'}>
          <span className={styles.oNum} style={{color:'var(--danger)'}}>{missingSkills.length}</span>
          <span className={styles.oLabel}>Gaps Detected</span>
        </div>
        <div className={styles.oCard + ' glass'}>
          <span className={styles.oNum} style={{color:'var(--warning)'}}>
            {requiredSkills.length > 0 ? Math.round((overlapSkills.length / requiredSkills.length) * 100) : 0}%
          </span>
          <span className={styles.oLabel}>Surface Match</span>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Required skills */}
        <div className={styles.section + ' glass'}>
          <h3 className={styles.sectionTitle}>📋 Required Skills</h3>
          <p className={styles.sectionSub}>Extracted from the job description</p>
          <div className={styles.skillList}>
            {requiredSkills.map((s, i) => {
              const isMatch = overlapSkills.some(o => o.toLowerCase() === s.name.toLowerCase());
              return (
                <div key={i} className={styles.skillRow + (isMatch ? ' '+styles.skillMatch : ' '+styles.skillGap)}>
                  <div className={styles.skillLeft}>
                    <span className={styles.skillDot} style={{background: isMatch ? 'var(--success)' : 'var(--danger)'}} />
                    <span className={styles.skillName}>{s.name}</span>
                  </div>
                  <div className={styles.skillRight}>
                    <span className={'badge ' + (IMPORTANCE_COLOR[s.importance] || 'badge-purple')}>{s.importance}</span>
                    <span style={{fontSize:'11px',color:LEVEL_COLOR[s.requiredLevel],fontWeight:600}}>{s.requiredLevel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate skills */}
        <div className={styles.section + ' glass'}>
          <h3 className={styles.sectionTitle}>👤 Your Skills</h3>
          <p className={styles.sectionSub}>Extracted from your resume</p>
          <div className={styles.chipGrid}>
            {candidateSkills.map((s, i) => {
              const isMatch = overlapSkills.some(o => o.toLowerCase() === s.toLowerCase());
              return (
                <span key={i} className={'chip'} style={isMatch ? {borderColor:'var(--success)',color:'var(--success)'} : {}}>
                  {isMatch ? '✓ ' : ''}{s}
                </span>
              );
            })}
          </div>

          {missingSkills.length > 0 && (
            <>
              <div style={{marginTop:'24px',marginBottom:'12px'}}>
                <h4 style={{fontSize:'13px',color:'var(--danger)',marginBottom:'8px'}}>⚠️ Missing from Resume</h4>
                <div className={styles.chipGrid}>
                  {missingSkills.map((s, i) => (
                    <span key={i} className="chip" style={{borderColor:'var(--danger)',color:'var(--danger)'}}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notice */}
      <div className={styles.notice + ' glass'}>
        <span className={styles.noticeIcon}>💡</span>
        <div>
          <strong>Surface match isn&apos;t enough.</strong>
          <p>Your resume mentions some skills, but the AI will now assess your <em>actual proficiency</em> through a conversational interview. This is where the real assessment begins.</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button id="start-assessment-btn" className="btn btn-primary" style={{fontSize:'15px',padding:'14px 36px'}} onClick={onStart}>
          🤖 Start AI Assessment →
        </button>
      </div>
    </div>
  );
}
