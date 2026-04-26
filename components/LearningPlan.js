'use client';
import { useState } from 'react';
import styles from './LearningPlan.module.css';

const TYPE_ICON = { Course: '🎓', Book: '📚', Project: '🛠️', Article: '📖', Video: '🎬', YouTube: '▶️' };
const PRIORITY_COLOR = { Critical: 'badge-red', High: 'badge-yellow', Medium: 'badge-purple' };

export default function LearningPlan({ plan, jobTitle }) {
  const [activeTab, setActiveTab] = useState('roadmap'); // roadmap | timeline | export
  const [expandedGap, setExpandedGap] = useState(0);

  const {
    summary = '',
    overallReadiness = 0,
    strengths = [],
    criticalGaps = [],
    weeklyPlan = [],
    totalEstimatedWeeks = 0,
    motivationalNote = '',
  } = plan;

  const handleExport = () => {
    const md = generateMarkdown(plan, jobTitle);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'learning-plan.md'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.headerBadge}>
            <span className="badge badge-green">✅ Plan Generated</span>
            <span className="badge badge-purple">{totalEstimatedWeeks} weeks total</span>
          </div>
          <h1>Your Personalised Learning Plan</h1>
          <p className={styles.summary}>{summary}</p>
        </div>
        <div className={styles.readinessCard + ' glass'}>
          <div className={styles.readinessCircle}>
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="url(#grad)" strokeWidth="8"
                strokeDasharray={`${(overallReadiness / 100) * 213.6} 213.6`}
                strokeLinecap="round" transform="rotate(-90 40 40)" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6c63ff" />
                  <stop offset="100%" stopColor="#ff6b9d" />
                </linearGradient>
              </defs>
            </svg>
            <span className={styles.readinessNum + ' grad-text'}>{overallReadiness}%</span>
          </div>
          <span className={styles.readinessLabel}>Job Ready</span>
          {strengths.length > 0 && (
            <div className={styles.strengths}>
              <p style={{fontSize:'11px',color:'var(--text-muted)',marginBottom:'6px'}}>YOUR STRENGTHS</p>
              {strengths.map((s, i) => <span key={i} className="chip" style={{fontSize:'11px'}}>✓ {s}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Motivational note */}
      {motivationalNote && (
        <div className={styles.motNote + ' glass'}>
          <span>💬</span>
          <p><em>{motivationalNote}</em></p>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        {['roadmap','timeline','export'].map(t => (
          <button key={t} id={`tab-${t}`}
            className={styles.tab + (activeTab === t ? ' '+styles.tabActive : '')}
            onClick={() => setActiveTab(t)}>
            {t === 'roadmap' ? '🗺️ Learning Roadmap' : t === 'timeline' ? '📅 Week-by-Week' : '⬇️ Export'}
          </button>
        ))}
      </div>

      {/* ROADMAP TAB */}
      {activeTab === 'roadmap' && (
        <div className={styles.roadmap}>
          {criticalGaps.length === 0 && (
            <div className={styles.allGood + ' glass'}>
              <span style={{fontSize:'3rem'}}>🎉</span>
              <h3>You&apos;re already well-matched!</h3>
              <p>No critical gaps found. Focus on deepening your existing skills.</p>
            </div>
          )}
          {criticalGaps.map((gap, i) => (
            <div key={i} className={styles.gapCard + ' glass'} style={{animationDelay:`${i*0.08}s`}}>
              <div className={styles.gapCardHeader} onClick={() => setExpandedGap(expandedGap === i ? -1 : i)}>
                <div className={styles.gapCardLeft}>
                  <div className={styles.gapNum}>{i + 1}</div>
                  <div>
                    <h3>{gap.skill}</h3>
                    <p>
                      <span style={{color:'var(--text-muted)'}}>
                        {gap.currentLevel} → {gap.targetLevel}
                      </span>
                      &nbsp;·&nbsp;~{gap.estimatedWeeks} weeks · {gap.weeklyHours}h/week
                    </p>
                  </div>
                </div>
                <div className={styles.gapCardRight}>
                  <span className={'badge ' + (PRIORITY_COLOR[gap.priority] || 'badge-purple')}>{gap.priority}</span>
                  <span className={styles.chevron + (expandedGap === i ? ' '+styles.chevronOpen : '')}>›</span>
                </div>
              </div>

              {expandedGap === i && (
                <div className={styles.gapCardBody}>
                  {/* Resources */}
                  <h4>📚 Curated Resources</h4>
                  <div className={styles.resources}>
                    {(gap.resources || []).map((r, j) => (
                      <a key={j} href={r.url || '#'} target="_blank" rel="noopener noreferrer"
                        className={styles.resourceCard}>
                        <div className={styles.resourceIcon}>{TYPE_ICON[r.type] || '📄'}</div>
                        <div className={styles.resourceInfo}>
                          <span className={styles.resourceTitle}>{r.title}</span>
                          <span className={styles.resourceMeta}>
                            {r.platform} · {r.duration}
                            {r.free && <span className={styles.freeBadge}>FREE</span>}
                          </span>
                        </div>
                        <span className={styles.resourceArrow}>↗</span>
                      </a>
                    ))}
                  </div>

                  {/* Practice project */}
                  {gap.practiceProject && (
                    <div className={styles.practiceProject}>
                      <h4>🛠️ Practice Project</h4>
                      <p>{gap.practiceProject}</p>
                    </div>
                  )}

                  {/* Adjacent skills */}
                  {gap.adjacentSkills?.length > 0 && (
                    <div className={styles.adjacentSkills}>
                      <h4>🔗 Adjacent Skills to Learn Alongside</h4>
                      <div className={styles.chipRow}>
                        {gap.adjacentSkills.map((s, k) => <span key={k} className="chip">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div className={styles.timeline}>
          {weeklyPlan.map((w, i) => (
            <div key={i} className={styles.weekCard + ' glass'} style={{animationDelay:`${i*0.06}s`}}>
              <div className={styles.weekBadge}>Week {w.week}</div>
              <div className={styles.weekContent}>
                <h3>{w.focus}</h3>
                <ul className={styles.weekGoals}>
                  {(w.goals || []).map((g, j) => <li key={j}>{g}</li>)}
                </ul>
              </div>
            </div>
          ))}
          {weeklyPlan.length === 0 && (
            <p style={{color:'var(--text-muted)',textAlign:'center',padding:'40px'}}>No weekly plan generated.</p>
          )}
        </div>
      )}

      {/* EXPORT TAB */}
      {activeTab === 'export' && (
        <div className={styles.exportTab + ' glass'}>
          <div className={styles.exportIcon}>📥</div>
          <h3>Export Your Learning Plan</h3>
          <p>Download your complete personalised roadmap as a Markdown file.</p>
          <div className={styles.exportActions}>
            <button id="export-md-btn" className="btn btn-primary" style={{fontSize:'15px',padding:'13px 28px'}} onClick={handleExport}>
              ⬇️ Download as Markdown
            </button>
            <button className="btn btn-ghost" onClick={() => {
              navigator.clipboard.writeText(generateMarkdown(plan, jobTitle));
              alert('Copied to clipboard!');
            }}>
              📋 Copy to Clipboard
            </button>
          </div>
          <div className={styles.exportPreview}>
            <pre>{generateMarkdown(plan, jobTitle).slice(0, 800)}…</pre>
          </div>
        </div>
      )}

      {/* Start over */}
      <div className={styles.footer}>
        <button className="btn btn-ghost" onClick={() => window.location.href = '/assess'}>
          ↩ New Assessment
        </button>
        <button className="btn btn-ghost" onClick={() => window.location.href = '/'}>
          🏠 Home
        </button>
      </div>
    </div>
  );
}

function generateMarkdown(plan, jobTitle) {
  const { summary, overallReadiness, strengths, criticalGaps, weeklyPlan, totalEstimatedWeeks, motivationalNote } = plan;
  let md = `# Personalised Learning Plan — ${jobTitle || 'Role'}\n\n`;
  md += `> ${motivationalNote || ''}\n\n`;
  md += `## Overall Readiness: ${overallReadiness}%\n\n`;
  md += `${summary}\n\n`;
  if (strengths?.length) md += `## ✅ Strengths\n${strengths.map(s => `- ${s}`).join('\n')}\n\n`;
  md += `## 📚 Learning Roadmap (${totalEstimatedWeeks} weeks)\n\n`;
  (criticalGaps || []).forEach((g, i) => {
    md += `### ${i+1}. ${g.skill} [${g.priority}]\n`;
    md += `**Level:** ${g.currentLevel} → ${g.targetLevel}  \n`;
    md += `**Time:** ~${g.estimatedWeeks} weeks at ${g.weeklyHours}h/week\n\n`;
    md += `**Resources:**\n`;
    (g.resources || []).forEach(r => { md += `- [${r.title}](${r.url}) — ${r.platform} · ${r.duration}${r.free ? ' (FREE)' : ''}\n`; });
    if (g.practiceProject) md += `\n**Practice Project:** ${g.practiceProject}\n`;
    if (g.adjacentSkills?.length) md += `\n**Adjacent Skills:** ${g.adjacentSkills.join(', ')}\n`;
    md += '\n';
  });
  md += `## 📅 Week-by-Week Plan\n\n`;
  (weeklyPlan || []).forEach(w => {
    md += `### Week ${w.week}: ${w.focus}\n`;
    (w.goals || []).forEach(g => { md += `- ${g}\n`; });
    md += '\n';
  });
  return md;
}
