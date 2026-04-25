'use client';
import { useState, useCallback } from 'react';
import UploadPanel from '@/components/UploadPanel';
import SkillMatrix from '@/components/SkillMatrix';
import ChatInterface from '@/components/ChatInterface';
import GapAnalysis from '@/components/GapAnalysis';
import LearningPlan from '@/components/LearningPlan';
import InterviewAvatar from '@/components/InterviewAvatar';
import styles from './assess.module.css';

const PHASES = ['Upload', 'Skills', 'Assess', 'Gaps', 'Plan'];

export default function AssessPage() {
  const [phase, setPhase]           = useState(0); // 0-4
  const [parsedData, setParsedData] = useState(null);
  const [assessedSkills, setAssessedSkills] = useState([]);
  const [learningPlan, setLearningPlan]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [latestAiMessage, setLatestAiMessage] = useState('');

  const handleDocumentsParsed = useCallback((data) => {
    setParsedData(data);
    setPhase(1);
  }, []);

  const handleStartAssessment = useCallback(() => {
    setPhase(2);
  }, []);

  const handleAssessmentComplete = useCallback((skills) => {
    setAssessedSkills(skills);
    setPhase(3);
  }, []);

  const handleGeneratePlan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { computeReadiness } = await import('@/lib/skillParser');
      const readiness = computeReadiness(assessedSkills, parsedData.requiredSkills);
      const res = await fetch('/api/learning-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessedSkills,
          requiredSkills: parsedData.requiredSkills,
          jobTitle: parsedData.jobTitle,
          candidateName: parsedData.candidateName,
          readiness,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setLearningPlan(json.data);
      setPhase(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [assessedSkills, parsedData]);

  return (
    <div className={styles.page}>
      {/* Orbs */}
      <div className={styles.orb1} /><div className={styles.orb2} />

      {/* Header */}
      <header className={styles.header}>
        <a href="/" className={styles.logo}>
          <span>⚡</span>
          <span className="grad-text" style={{fontFamily:'Space Grotesk',fontWeight:700}}>Catalyst</span>
        </a>
        {/* Phase stepper */}
        <div className={styles.stepper}>
          {PHASES.map((p, i) => (
            <div key={p} className={styles.stepWrap}>
              <div className={`${styles.step} ${i < phase ? styles.stepDone : ''} ${i === phase ? styles.stepActive : ''}`}>
                {i < phase ? '✓' : i + 1}
              </div>
              <span className={`${styles.stepLabel} ${i === phase ? styles.stepLabelActive : ''}`}>{p}</span>
              {i < PHASES.length - 1 && <div className={`${styles.stepLine} ${i < phase ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className={styles.main}>
        {error && (
          <div className={styles.errorBanner}>
            ⚠️ {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {phase === 0 && <UploadPanel onComplete={handleDocumentsParsed} />}
        {phase === 1 && parsedData && (
          <SkillMatrix data={parsedData} onStart={handleStartAssessment} />
        )}
        {phase === 2 && parsedData && (
          <div className={styles.interviewLayout}>
            <div className={styles.chatArea}>
              <ChatInterface
                parsedData={parsedData}
                onComplete={handleAssessmentComplete}
                onAiMessage={setLatestAiMessage}
              />
            </div>
            <div className={styles.avatarArea}>
              <InterviewAvatar latestMessage={latestAiMessage} />
            </div>
          </div>
        )}
        {phase === 3 && (
          <GapAnalysis
            parsedData={parsedData}
            assessedSkills={assessedSkills}
            onGeneratePlan={handleGeneratePlan}
            loading={loading}
          />
        )}
        {phase === 4 && learningPlan && (
          <LearningPlan plan={learningPlan} jobTitle={parsedData?.jobTitle} />
        )}
      </main>
    </div>
  );
}
