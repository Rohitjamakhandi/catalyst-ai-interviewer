'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './InterviewAvatar.module.css';

export default function InterviewAvatar({ latestMessage }) {
  const [status, setStatus] = useState('Initializing...');
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const streamInfoRef = useRef({ streamId: null, sessionId: null });

  // Initialize WebRTC stream
  useEffect(() => {
    let pc;
    const initStream = async () => {
      setStatus('Connecting to Maya...');
      try {
        // 1. Create Stream
        const createRes = await fetch('/api/did/create-stream', { method: 'POST' });
        const createData = await createRes.json();
        
        if (createData.error) throw new Error(createData.error);
        
        const { id: streamId, session_id: sessionId, offer, ice_servers } = createData;
        streamInfoRef.current = { streamId, sessionId };

        // 2. Create Peer Connection
        pc = new RTCPeerConnection({ iceServers: ice_servers });
        pcRef.current = pc;

        // 3. Handle ICE Candidates
        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            await fetch('/api/did/ice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                streamId,
                sessionId,
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
              })
            });
          }
        };

        // 4. Handle incoming video stream
        pc.ontrack = (event) => {
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            setStatus('Connected');
          }
        };

        // 5. Connection state changes
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
            setStatus('Disconnected');
          }
        };

        // 6. Set Remote Description (Offer)
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // 7. Create Answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // 8. Send SDP Answer back
        await fetch('/api/did/sdp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streamId,
            sessionId,
            answer,
          })
        });

      } catch (err) {
        console.error('WebRTC Init Error:', err);
        setStatus('Connection failed');
      }
    };

    initStream();

    return () => {
      // Cleanup
      if (pc) pc.close();
      const { streamId, sessionId } = streamInfoRef.current;
      if (streamId && sessionId) {
        fetch(`/api/did/create-stream?streamId=${streamId}&sessionId=${sessionId}`, {
          method: 'DELETE'
        }).catch(e => console.error(e));
      }
    };
  }, []);

  // Handle incoming messages to speak
  useEffect(() => {
    if (!latestMessage) return;
    const { streamId, sessionId } = streamInfoRef.current;
    if (!streamId || !sessionId) return;

    // Clean up internal tags
    const textToSpeak = latestMessage
      .replace(/SKILL_ASSESSED:.*?\|.*?(?:Beginner|Intermediate|Advanced|Expert)/gi, '')
      .replace('ASSESSMENT_COMPLETE', '')
      .trim();

    if (!textToSpeak) return;

    setStatus('Speaking...');
    fetch('/api/did/talk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamId,
        sessionId,
        text: textToSpeak
      })
    }).then(() => {
      // After a few seconds, revert status (rough estimation, ideally we use D-ID callbacks but this is fine)
      setTimeout(() => setStatus('Connected'), 5000);
    }).catch(err => {
      console.error('Talk error:', err);
      setStatus('Connected');
    });

  }, [latestMessage]);

  return (
    <div className={`${styles.avatarContainer} ${status === 'Speaking...' ? styles.speaking : ''}`}>
      <div className={styles.avatarWrapper}>
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          className={styles.avatarImage} 
          style={{ backgroundColor: '#000' }}
        />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>Maya</h3>
        <p className={styles.title}>Catalyst AI Interviewer</p>
        <div className={styles.statusBadge}>
          {status}
        </div>
      </div>
    </div>
  );
}
