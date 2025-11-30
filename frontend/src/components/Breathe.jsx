import React, { useState, useEffect, useRef } from 'react';
import { FiWind, FiPlay, FiStopCircle } from 'react-icons/fi';
import api from '../services/api';
import './Breathe.css';

const CALM_BREATH = {
  id: 'calm-cool',
  title: 'Calm & Cool (शांत और शीतल)',
  description: 'Relax your mind and body with this simple breathing exercise. (अपने मन और शरीर को शांत करें)',
  icon: <FiWind />,
  phases: [
    { name: 'Inhale', duration: 4000, instruction: 'Breathe In (सांस लें)' },
    { name: 'Hold', duration: 4000, instruction: 'Hold (रोकें)' },
    { name: 'Exhale', duration: 6000, instruction: 'Breathe Out (सांस छोड़ें)' },
    { name: 'Hold', duration: 2000, instruction: 'Hold (रोकें)' }
  ]
};

const Breathe = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const phaseDurationRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, []);

  const startSession = () => {
    setIsActive(true);
    setCurrentPhaseIndex(0);
    setCycles(1);
    setSessionStartTime(Date.now());
    startPhase(CALM_BREATH.phases[0]);
  };

  const stopSession = async () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);

    // Save session to DB
    if (sessionStartTime) {
      const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
      if (durationSeconds > 5) { // Only save if > 5 seconds
        try {
          await api.logBreathSession({
            technique_id: CALM_BREATH.id,
            technique_name: CALM_BREATH.title,
            duration_seconds: durationSeconds
          });
          console.log('Session saved');
        } catch (err) {
          console.error('Failed to save session', err);
        }
      }
    }

    setIsActive(false);
    setSessionStartTime(null);
  };

  const startPhase = (phase) => {
    phaseDurationRef.current = phase.duration;
    startTimeRef.current = Date.now();
    setTimeLeft(phase.duration);

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, phaseDurationRef.current - elapsed);

      setTimeLeft(remaining);

      if (remaining > 0) {
        timerRef.current = requestAnimationFrame(animate);
      } else {
        nextPhase();
      }
    };

    timerRef.current = requestAnimationFrame(animate);
  };

  const nextPhase = () => {
    const nextIndex = (currentPhaseIndex + 1) % CALM_BREATH.phases.length;

    // If we wrapped around to 0, a cycle is complete
    if (nextIndex === 0) {
      setCycles(c => c + 1);
    }

    setCurrentPhaseIndex(nextIndex);
    startPhase(CALM_BREATH.phases[nextIndex]);
  };

  const getAnimationClass = () => {
    const phaseName = CALM_BREATH.phases[currentPhaseIndex].name.toLowerCase();
    if (phaseName.includes('inhale')) return 'inhale';
    if (phaseName.includes('exhale')) return 'exhale';
    return 'hold';
  };

  const getAnimationStyle = () => {
    return {
      '--duration': `${CALM_BREATH.phases[currentPhaseIndex].duration}ms`
    };
  };

  return (
    <div className="page-container breathe-container">
      {!isActive ? (
        <>
          <header className="page-header">
            <h1 className="page-title">Breathe & Relax (प्राणायाम)</h1>
            <p className="page-subtitle">{CALM_BREATH.description}</p>
          </header>

          <div className="technique-card single-technique" onClick={startSession}>
            <div className="technique-icon">{CALM_BREATH.icon}</div>
            <h3 className="technique-title">{CALM_BREATH.title}</h3>
            <div style={{ marginTop: '24px', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
              <FiPlay /> Start Session (शुरू करें)
            </div>
          </div>
        </>
      ) : (
        <div className="session-container">
          <div className="cycle-counter">
            Cycle {cycles}
          </div>

          <div className="circle-container">
            <div
              key={`${currentPhaseIndex}`}
              className={`breathing-circle ${getAnimationClass()}`}
              style={getAnimationStyle()}
            />

            <div className="inner-circle">
              <span className="instruction-text">
                {CALM_BREATH.phases[currentPhaseIndex].instruction}
              </span>
              <span className="timer-text">
                {Math.ceil(timeLeft / 1000)}s
              </span>
            </div>
          </div>

          <div className="controls">
            <button className="btn-stop" onClick={stopSession}>
              <FiStopCircle style={{ marginRight: '8px' }} /> End Session (समाप्त करें)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Breathe;