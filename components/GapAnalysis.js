'use client';
import { useMemo } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { computeGapScore, gapSeverity, gapColor, computeReadiness, proficiencyToScore } from '@/lib/skillParser';
import styles from './GapAnalysis.module.css';

const LEVEL_ORDER = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function GapAnalysis({ parsedData, assessedSkills, onGeneratePlan, loading }) {
  const { requiredSkills = [], jobTitle } = parsedData;

  const gaps = useMemo(() => requiredSkills.map(req => {
    const assessed = assessedSkills.find(a => a.name.toLowerCase() === req.name.toLowerCase());
    const assessedLevel = assessed?.level || 'Beginner';
    const gapScore = computeGapScore(req.requiredLevel, assessedLevel);
    return {
      ...req,
      assessedLevel,
      gapScore,
      severity: gapSeverity(gapScore),
    };
  }).sort((a, b) => b.gapScore - a.gapScore), [requiredSkills, assessedSkills]);

  const readiness = useMemo(() => computeReadiness(assessedSkills, requiredSkills), [assessedSkills, requiredSkills]);

  const radarData = useMemo(() => requiredSkills.map(s => {
    const assessed = assessedSkills.find(a => a.name.toLowerCase() === s.name.toLowerCase());
    return {
      skill: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
      Required:  proficiencyToScore(s.requiredLevel),
      Assessed:  proficiencyToScore(assessed?.level || 'Beginner'),
    };
  }), [requiredSkills, assessedSkills]);

  const criticalCount = gaps.filter(g => g.severity === 'Critical').length;
  const highCount     = gaps.filter(g => g.severity === 'High').length;
  const noneCount     = gaps.filter(g => g.severity === 'None').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1>Gap Analysis — <span className="grad-text">{jobTitle}</span></h1>
          <p>Here's an honest picture of where you stand today.</p>
        </div>
        <div className={styles.readinessBadge}>
          <div className={styles.readinessRing} style={{'--pct': `${readiness}%`}}>
            <span className={styles.readinessNum + ' grad-text'}>{readiness}%</span>
          </div>
          <span style={{fontSize:'13px',color:'var(--text-secondary)'}}>Job Ready</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryCards}>
        <div className={styles.sCard + ' glass'}>
          <span className={styles.sNum} style={{color:'var(--danger)'}}>{criticalCount}</span>
          <span className={styles.sLabel}>Critical Gaps</span>
        </div>
        <div className={styles.sCard + ' glass'}>
          <span className={styles.sNum} style={{color:'var(--warning)'}}>{highCount}</span>
          <span className={styles.sLabel}>High Priority</span>
        </div>
        <div className={styles.sCard + ' glass'}>
          <span className={styles.sNum} style={{color:'var(--success)'}}>{noneCount}</span>
          <span className={styles.sLabel}>Skills Matched</span>
        </div>
        <div className={styles.sCard + ' glass'}>
          <span className={styles.sNum} style={{color:'var(--accent)'}}>{assessedSkills.length}</span>
          <span className={styles.sLabel}>Skills Assessed</span>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Radar chart */}
        <div className={styles.chartCard + ' glass'}>
          <h3>Skill Coverage Radar</h3>
          <p>Required (blue) vs. your level (green)</p>
          <div className={styles.radarWrap}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="skill" tick={{fill:'#8b8fa8',fontSize:11}} />
                <Radar name="Required" dataKey="Required" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Assessed" dataKey="Assessed" stroke="#00d4aa" fill="#00d4aa" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip
                  contentStyle={{background:'#0d1117',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',color:'#f0f0f0'}}
                  formatter={(val) => LEVEL_ORDER[val - 1] || val}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.legend}>
            <span><span style={{background:'#6c63ff',display:'inline-block',width:12,height:12,borderRadius:3,marginRight:6}} />Required</span>
            <span><span style={{background:'#00d4aa',display:'inline-block',width:12,height:12,borderRadius:3,marginRight:6}} />Your Level</span>
          </div>
        </div>

        {/* Gap list */}
        <div className={styles.gapList + ' glass'}>
          <h3>Skill-by-Skill Breakdown</h3>
          <p>Sorted by gap size — biggest gaps first</p>
          <div className={styles.gapItems}>
            {gaps.map((g, i) => (
              <div key={i} className={styles.gapItem}>
                <div className={styles.gapTop}>
                  <span className={styles.gapName}>{g.name}</span>
                  <span className="badge" style={{
                    background:`${gapColor(g.severity)}22`,
                    color: gapColor(g.severity),
                    border:`1px solid ${gapColor(g.severity)}44`
                  }}>{g.severity}</span>
                </div>
                <div className={styles.gapBar}>
                  <div className={styles.gapBarTrack}>
                    <div className={styles.gapBarFill} style={{
                      width:`${(proficiencyToScore(g.assessedLevel) / 4) * 100}%`,
                      background: gapColor(g.severity),
                    }} />
                  </div>
                  <div className={styles.gapBarTrack} style={{opacity:0.3}}>
                    <div className={styles.gapBarFill} style={{
                      width:`${(proficiencyToScore(g.requiredLevel) / 4) * 100}%`,
                      background:'var(--accent)',
                    }} />
                  </div>
                </div>
                <div className={styles.gapLevels}>
                  <span>You: <strong style={{color: gapColor(g.severity)}}>{g.assessedLevel}</strong></span>
                  <span>Required: <strong style={{color:'var(--accent)'}}>{g.requiredLevel}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          id="generate-plan-btn"
          className="btn btn-primary"
          style={{fontSize:'15px',padding:'14px 36px'}}
          onClick={onGeneratePlan}
          disabled={loading}
        >
          {loading
            ? <><span className="animate-spin" style={{display:'inline-block'}}>⟳</span> Generating Plan…</>
            : '🗺️ Generate My Learning Plan →'}
        </button>
        <p style={{color:'var(--text-muted)',fontSize:'13px',marginTop:'8px'}}>
          AI will create a personalised week-by-week roadmap based on your gaps
        </p>
      </div>
    </div>
  );
}
