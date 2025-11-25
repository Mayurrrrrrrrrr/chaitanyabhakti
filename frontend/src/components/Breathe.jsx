import React, { useState, useEffect, useRef } from 'react';
import { FiWind, FiActivity, FiCircle, FiPlay, FiStopCircle, FiClock } from 'react-icons/fi';
import api from '../services/api';
import './Breathe.css';

const TECHNIQUES = [
  {
    id: '4-7-8',
    title: 'Relaxing Breath (4-7-8)',
    description: 'A natural tranquilizer for the nervous system. Helps reduce anxiety and aids sleep.',
    icon: <FiWind />,
    phases: [
      { name: 'Inhale', duration: 4000, instruction: 'Breathe In...' },
      { name: 'Hold', duration: 7000, instruction: 'Hold...' },
      { name: 'Exhale', duration: 8000, instruction: 'Breathe Out...' }
    ]
  },
  {
    id: 'box',
    title: 'Box Breathing',
    description: 'Used by Navy SEALs for focus and stress control. Equal duration for all phases.',
    icon: <FiActivity />,
    phases: [
      { name: 'Inhale', duration: 4000, instruction: 'Breathe In...' },
      { name: 'Hold', duration: 4000, instruction: 'Hold...' },
      { name: 'Exhale', duration: 4000, instruction: 'Breathe Out...' },
      { name: 'Hold', duration: 4000, instruction: 'Hold...' }
    ]
  },
  {
    id: 'coherent',
    title: 'Coherent Breathing',
    description: 'Balances the autonomic nervous system. Smooth, continuous breathing.',
    icon: <FiCircle />,
    phases: [
      { name: 'Inhale', duration: 6000, instruction: 'Breathe In...' },
      { name: 'Exhale', duration: 6000, instruction: 'Breathe Out...' }
    ]
  },
  {
    id: 'retention',
    title: 'Breath Retention',
    description: 'Advanced practice for lung capacity. Deep inhale, long hold, slow exhale.',
    icon: <FiClock />,
    phases: [
      { name: 'Inhale', duration: 5000, instruction: 'Deep Inhale...' },
      { name: 'Hold', duration: 15000, instruction: 'Hold (Retention)...' },
      { name: 'Exhale', duration: 10000, instruction: 'Slow Exhale...' }
    ]
  }
];

const Breathe = () => {
  const [activeTechnique, setActiveTechnique] = useState(null);
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

  const startSession = (technique) => {
    setActiveTechnique(technique);
    setIsActive(true);
    setCurrentPhaseIndex(0);
    setCycles(1);
    setSessionStartTime(Date.now());
    startPhase(technique.phases[0]);
  };

  const stopSession = async () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);

    // Save session to DB
    if (sessionStartTime && activeTechnique) {
      const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
      if (durationSeconds > 5) { // Only save if > 5 seconds
        try {
          await api.logBreathSession({
            technique_id: activeTechnique.id,
            technique_name: activeTechnique.title,
            duration_seconds: durationSeconds
          });
          console.log('Session saved');
        } catch (err) {
          console.error('Failed to save session', err);
        }
      }
    }

    setIsActive(false);
    setActiveTechnique(null);
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
    if (!activeTechnique) return;

    const nextIndex = (currentPhaseIndex + 1) % activeTechnique.phases.length;

    // If we wrapped around to 0, a cycle is complete
    if (nextIndex === 0) {
      setCycles(c => c + 1);
    }

    setCurrentPhaseIndex(nextIndex);
    startPhase(activeTechnique.phases[nextIndex]);
  };

  const getAnimationClass = () => {
    if (!activeTechnique) return '';
    const phaseName = activeTechnique.phases[currentPhaseIndex].name.toLowerCase();
    if (phaseName.includes('inhale')) return 'inhale';
    if (phaseName.includes('exhale')) return 'exhale';
    return 'hold';
  };

  const getAnimationStyle = () => {
    if (!activeTechnique) return {};
    return {
      '--duration': `${activeTechnique.phases[currentPhaseIndex].duration}ms`
    };
  };

  return (
    <div className="page-container breathe-container">
      {!isActive ? (
        <>
          <header className="page-header">
            <h1 className="page-title">Breathe & Relax</h1>
            <p className="page-subtitle">Choose a breathing technique to calm your mind</p>
          </header>

          <div className="technique-grid">
            {TECHNIQUES.map((tech) => (
              <div
                key={tech.id}
                className="technique-card"
                onClick={() => startSession(tech)}
              >
                <div className="technique-icon">{tech.icon}</div>
                <h3 className="technique-title">{tech.title}</h3>
                <p className="technique-desc">{tech.description}</p>
                <div style={{ marginTop: '16px', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiPlay /> Start
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="session-container">
          <div className="cycle-counter">
            Cycle {cycles}
          </div>

          <div className="circle-container">
            <div
              key={`${activeTechnique.id}-${currentPhaseIndex}`}
              className={`breathing-circle ${getAnimationClass()}`}
              style={getAnimationStyle()}
            />

            <div className="inner-circle">
              <span className="instruction-text">
                {activeTechnique.phases[currentPhaseIndex].instruction}
              </span>
              <span className="timer-text">
                {Math.ceil(timeLeft / 1000)}s
              </span>
            </div>
          </div>

          <div className="controls">
            <button className="btn-stop" onClick={stopSession}>
              <FiStopCircle style={{ marginRight: '8px' }} /> End Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Breathe;