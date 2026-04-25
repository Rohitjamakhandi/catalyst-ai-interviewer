'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { parseSkillAssessed, isAssessmentComplete } from '@/lib/skillParser';
import styles from './ChatInterface.module.css';

export default function ChatInterface({ parsedData, onComplete, onAiMessage }) {
  const { requiredSkills = [], jobTitle, candidateName, candidateExperience } = parsedData;

  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [assessedSkills, setAssessed] = useState([]);
  const [currentSkill, setCurrentSkill] = useState(requiredSkills[0]?.name || '');
  const [isComplete, setIsComplete]   = useState(false);
  const [started, setStarted]         = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const skillsContext = `
Job: ${jobTitle}
Candidate: ${candidateName || 'Candidate'} | Experience: ${candidateExperience || 'Unknown'}
Skills to assess (in order): ${requiredSkills.map(s => `${s.name} (Required: ${s.requiredLevel})`).join(', ')}
`;

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = useCallback(async (userText, allMessages) => {
    setLoading(true);
    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, skillsContext }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const aiText = json.message;
      const aiMsg  = { role: 'assistant', content: aiText, ts: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      
      if (onAiMessage) {
        onAiMessage(aiText);
      }

      // Parse skill assessed tag
      const result = parseSkillAssessed(aiText);
      if (result) {
        setAssessed(prev => {
          const exists = prev.find(s => s.name.toLowerCase() === result.skill.toLowerCase());
          if (exists) return prev;
          return [...prev, { name: result.skill, level: result.level }];
        });
        // Move to next skill
        const idx = requiredSkills.findIndex(s => s.name.toLowerCase() === result.skill.toLowerCase());
        if (idx >= 0 && idx < requiredSkills.length - 1) setCurrentSkill(requiredSkills[idx + 1].name);
      }

      if (isAssessmentComplete(aiText)) {
        setIsComplete(true);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'error', content: e.message, ts: Date.now() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [skillsContext, requiredSkills]);

  const startAssessment = useCallback(async () => {
    setStarted(true);
    const startMsg = { role: 'user', content: 'Start the assessment.', ts: Date.now() };
    setMessages([startMsg]);
    await sendMessage('Start the assessment.', [startMsg]);
  }, [sendMessage]);

  const handleSend = async () => {
    if (!input.trim() || loading || isComplete) return;
    const userMsg = { role: 'user', content: input.trim(), ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    await sendMessage(input.trim(), newMessages);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const progressPct = requiredSkills.length > 0
    ? Math.round((assessedSkills.length / requiredSkills.length) * 100)
    : 0;

  return (
    <div className={styles.wrap}>
      {/* Sidebar */}
      <aside className={styles.sidebar + ' glass'}>
        <h3 className={styles.sideTitle}>Assessment Progress</h3>
        <div className={styles.progressWrap}>
          <div className="progress-bar"><div className="progress-fill" style={{width:`${progressPct}%`}} /></div>
          <span className={styles.progressLabel}>{assessedSkills.length} / {requiredSkills.length} skills</span>
        </div>
        <div className={styles.skillTracker}>
          {requiredSkills.map((s, i) => {
            const assessed = assessedSkills.find(a => a.name.toLowerCase() === s.name.toLowerCase());
            const isCurrent = s.name === currentSkill && !isComplete;
            return (
              <div key={i} className={styles.trackerItem + (isCurrent ? ' '+styles.trackerCurrent : '')}>
                <div className={styles.trackerDot + (assessed ? ' '+styles.trackerDone : isCurrent ? ' '+styles.trackerActive : '')}>
                  {assessed ? '✓' : isCurrent ? '●' : i + 1}
                </div>
                <div className={styles.trackerInfo}>
                  <span className={styles.trackerName}>{s.name}</span>
                  {assessed && (
                    <span className={styles.trackerLevel} style={{color: assessed.level === 'Expert' ? 'var(--success)' : assessed.level === 'Advanced' ? 'var(--warning)' : 'var(--text-muted)'}}>
                      {assessed.level}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {isComplete && (
          <button
            id="view-gaps-btn"
            className="btn btn-primary"
            style={{width:'100%',marginTop:'20px',justifyContent:'center'}}
            onClick={() => onComplete(assessedSkills)}
          >
            View Gap Analysis →
          </button>
        )}
      </aside>

      {/* Chat */}
      <div className={styles.chatWrap}>
        <div className={styles.chatHeader}>
          <div className={styles.aiAvatar}>🤖</div>
          <div>
            <h3>Catalyst AI Interviewer</h3>
            <p style={{fontSize:'12px',color:'var(--text-muted)'}}>
              {isComplete ? '✅ Assessment Complete' : loading ? 'Typing…' : `Assessing: ${currentSkill}`}
            </p>
          </div>
          {!isComplete && <span className="badge badge-purple" style={{marginLeft:'auto'}}>{progressPct}% done</span>}
        </div>

        <div className={styles.messages}>
          {!started ? (
            <div className={styles.startPrompt}>
              <div className={styles.startIcon}>🎯</div>
              <h3>Ready for Your Assessment?</h3>
              <p>The AI will ask you {requiredSkills.length} skill-based questions through natural conversation. Answer honestly — this is for your benefit!</p>
              <button id="begin-btn" className="btn btn-primary" style={{marginTop:'20px'}} onClick={startAssessment}>
                Begin Assessment
              </button>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : m.role === 'error' ? styles.msgError : styles.msgAI}`}
                style={{animationDelay:`${i*0.05}s`}}>
                {m.role === 'assistant' && <div className={styles.msgAvatar}>🤖</div>}
                <div className={styles.msgBubble}>
                  {/* Strip internal tags for display */}
                  {m.content.replace(/SKILL_ASSESSED:.*?\|.*?(?:Beginner|Intermediate|Advanced|Expert)/gi, '').replace('ASSESSMENT_COMPLETE','').trim()}
                </div>
                {m.role === 'user' && <div className={styles.msgAvatar}>👤</div>}
              </div>
            ))
          )}
          {loading && (
            <div className={styles.msg + ' ' + styles.msgAI}>
              <div className={styles.msgAvatar}>🤖</div>
              <div className={styles.typingIndicator}>
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {!isComplete && started && (
          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              id="chat-input"
              className="input"
              style={{resize:'none',minHeight:'52px',maxHeight:'140px',lineHeight:'1.6'}}
              placeholder={isListening ? "Listening... Speak now." : "Type your answer… (Enter to send, Shift+Enter for new line)"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
              style={{height:'52px',padding:'0 16px',flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center'}}
              onClick={toggleListening}
              disabled={loading || !recognitionRef.current}
              title="Speak your answer"
            >
              {isListening ? '🛑' : '🎤'}
            </button>
            <button
              id="send-btn"
              className="btn btn-primary"
              style={{height:'52px',padding:'0 20px',flexShrink:0}}
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? <span className="animate-spin">⟳</span> : '↑'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
