'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './InterviewAvatar.module.css';

export default function InterviewAvatar({ latestMessage }) {
  const [status, setStatus]               = useState('Connecting...');
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [videoConnected, setVideoConnected] = useState(false);
  const videoRef       = useRef(null);
  const streamInfoRef  = useRef({ streamId: null, sessionId: null });
  const mountedRef     = useRef(true);
  const pcRef          = useRef(null);
  const streamRef      = useRef(null); // holds the MediaStream

  // ── D-ID WebRTC (official D-ID pattern) ──────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    const connect = async () => {
      try {
        setStatus('Connecting to Maya...');

        // 1. Create stream
        const res  = await fetch('/api/did/create-stream', { method: 'POST' });
        const data = await res.json();
        if (!mountedRef.current) return;
        if (data.error) throw new Error(data.error);

        const { id: streamId, session_id: sessionId, offer, ice_servers } = data;
        streamInfoRef.current = { streamId, sessionId };

        // 2. Peer connection — no policy restriction so both STUN & TURN work
        const pc = new RTCPeerConnection({ iceServers: ice_servers });
        pcRef.current = pc;

        // 3. Collect all tracks into one MediaStream, attach when both arrive
        const mediaStream = new MediaStream();
        streamRef.current = mediaStream;

        pc.ontrack = (event) => {
          console.log('[Maya] track received:', event.track.kind);
          // Add every track to our combined stream
          event.track.onunmute = () => {
            mediaStream.addTrack(event.track);

            // Once we have at least a video track, show it
            if (event.track.kind === 'video' && videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              // Play muted first (browser policy), then unmute
              videoRef.current.muted = true;
              videoRef.current.play()
                .then(() => {
                  // User gesture from "Start Assessment" allows unmuting
                  videoRef.current.muted = false;
                  if (mountedRef.current) {
                    setVideoConnected(true);
                    setStatus('Ready');
                  }
                })
                .catch(() => {
                  // Keep muted if autoplay with sound still blocked
                  if (mountedRef.current) {
                    setVideoConnected(true);
                    setStatus('Ready');
                  }
                });
            }
          };
        };

        // 4. ICE state
        pc.oniceconnectionstatechange = () => {
          const s = pc.iceConnectionState;
          console.log('[Maya] ICE:', s);
          if (!mountedRef.current) return;
          if (s === 'connected' || s === 'completed') setStatus('Ready');
          if (s === 'failed') setStatus('Reconnecting...');
        };

        // 5. Send ICE candidates to D-ID
        pc.onicecandidate = ({ candidate }) => {
          if (!candidate) return;
          fetch('/api/did/ice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              streamId, sessionId,
              candidate: candidate.candidate,
              sdpMid: candidate.sdpMid,
              sdpMLineIndex: candidate.sdpMLineIndex,
            }),
          }).catch(() => {});
        };

        // 6. Set remote description (D-ID's offer)
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // 7. Create & send answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // 8. Send SDP answer
        const sdpRes = await fetch('/api/did/sdp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamId, sessionId, answer }),
        });
        if (!sdpRes.ok) throw new Error('SDP exchange failed');

        setStatus('Waiting for Maya...');
        console.log('[Maya] Handshake done ✓');

      } catch (err) {
        console.error('[Maya] Error:', err.message);
        if (mountedRef.current) setStatus('Reconnect failed');
      }
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
      const { streamId, sessionId } = streamInfoRef.current;
      if (streamId && sessionId) {
        fetch(`/api/did/create-stream?streamId=${streamId}&sessionId=${sessionId}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
    };
  }, []);

  // ── D-ID Talk: real lip-sync + voice through WebRTC ──────────────
  useEffect(() => {
    if (!latestMessage) return;
    const { streamId, sessionId } = streamInfoRef.current;
    if (!streamId || !sessionId) return;

    const clean = latestMessage
      .replace(/SKILL_ASSESSED:.*?\|.*?(?:Beginner|Intermediate|Advanced|Expert)/gi, '')
      .replace('ASSESSMENT_COMPLETE', '')
      .replace(/[*_#>`~]/g, '')
      .trim();

    if (!clean) return;

    setIsSpeaking(true);
    setStatus('Speaking...');

    fetch('/api/did/talk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamId, sessionId, text: clean }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.text();
          console.warn('[Maya] Talk API error:', err);
        }
        // Estimate speaking time from word count
        const ms = Math.max(4000, clean.split(' ').length * 550);
        setTimeout(() => {
          if (mountedRef.current) { setIsSpeaking(false); setStatus('Ready'); }
        }, ms);
      })
      .catch((e) => {
        console.error('[Maya] Talk fetch error:', e);
        setIsSpeaking(false);
        setStatus('Ready');
      });
  }, [latestMessage]);

  // Tap on video to unmute if browser blocked auto-unmute
  const handleVideoClick = () => {
    if (videoRef.current && videoRef.current.muted) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className={`${styles.avatarContainer} ${isSpeaking ? styles.speaking : ''}`}>
      <div className={styles.avatarWrapper}>
        {/* Glow rings */}
        <div className={`${styles.ring} ${isSpeaking ? styles.ringActive : ''}`} />
        <div className={`${styles.ring} ${styles.ring2} ${isSpeaking ? styles.ringActive : ''}`} />

        {/* ★ Live D-ID video — ALWAYS in DOM, never display:none */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.avatarVideo}
          onClick={handleVideoClick}
        />

        {/* Static photo — fades away when D-ID video connects */}
        <img
          src="https://files.catbox.moe/nw2pdt.png"
          alt="Maya"
          className={`${styles.avatarPhoto} ${videoConnected ? styles.avatarPhotoHidden : ''}`}
        />

        {/* Speaking animation bars */}
        {isSpeaking && (
          <div className={styles.mouthAnim}>
            <span /><span /><span /><span /><span />
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>Maya</h3>
        <p className={styles.title}>Catalyst AI Interviewer</p>
        <div className={`${styles.statusBadge} ${isSpeaking ? styles.statusSpeaking : ''}`}>
          <span className={`${styles.statusDot} ${isSpeaking ? styles.dotSpeaking : ''}`} />
          {status}
        </div>
      </div>
    </div>
  );
}
