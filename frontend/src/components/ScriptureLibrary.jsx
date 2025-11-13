//
// FILE: frontend/src/components/ScriptureLibrary.jsx
//
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ScriptureLibrary.css';
import { FiBookOpen, FiPlay, FiSquare } from 'react-icons/fi';

// --- Text-to-Speech (TTS) Setup ---
const synth = window.speechSynthesis;

// Reusable Card component for scriptures
const ScriptureCard = ({ scripture, onSpeak, isSpeaking, currentlySpeakingId, rate, pitch, volume, voice }) => {
  const { scripture_id, title, description, cover_url } = scripture;
  const isThisSpeaking = isSpeaking && currentlySpeakingId === scripture_id;

  const handleSpeakClick = () => {
    if (isThisSpeaking) {
      // If this card is speaking, stop it
      synth.cancel();
      onSpeak(null, false); // Clear speaking state
    } else {
      // If another card is speaking, stop it first.
      if (isSpeaking) {
        synth.cancel();
      }
      // Start speaking this card's content
      const textToSpeak = `${title}. ${description || 'No description available.'}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'hi-IN';
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      if (voice) utterance.voice = voice;
      
      utterance.onend = () => {
        onSpeak(null, false); // Clear speaking state when done
      };
      utterance.onerror = () => {
        console.error('Speech synthesis error');
        onSpeak(null, false); // Clear on error
      };
      
      synth.speak(utterance);
      onSpeak(scripture_id, true); // Set this card as speaking
    }
  };

  return (
    <div className="scripture-card">
      {cover_url && <img src={cover_url} alt={title} className="scripture-cover" />}
      <div className="scripture-info">
        <h3>{title}</h3>
        <p>{description}</p>
        
        {/* --- PRIORITY 2: TTS "Read Aloud" Button --- */}
        {synth && (
          <button className={`tts-button ${isThisSpeaking ? 'speaking' : ''}`} onClick={handleSpeakClick}>
            {isThisSpeaking ? <FiSquare /> : <FiPlay />}
            {isThisSpeaking ? 'Stop' : 'Listen'}
          </button>
        )}
      </div>
    </div>
  );
};

const ScriptureLibrary = () => {
  const [scriptures, setScriptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- TTS State ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    const fetchScriptures = async () => {
      try {
        setLoading(true);
        const res = await api.get('/scriptures'); // Fetch all public scriptures
        setScriptures(res.data);
      } catch (err) {
        console.error('Failed to fetch scriptures:', err);
        setError('Could not load scripture library.');
      } finally {
        setLoading(false);
      }
    };
    fetchScriptures();

    // Cleanup: Stop any speech when the user navigates away
    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);
  useEffect(() => {
    const updateVoices = () => {
      const voices = synth.getVoices();
      const preferred = voices.find(v => /hi|Hindi|India/i.test((v.lang || '') + ' ' + (v.name || '')));
      setVoice(preferred || voices[0] || null);
    };
    updateVoices();
    if (typeof window !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleSpeak = (scripture_id, speaking) => {
    setCurrentlySpeakingId(scripture_id);
    setIsSpeaking(speaking);
  };

  return (
    <div className="library-container">
      <header className="library-header">
        <FiBookOpen size={28} />
        <h1>Scripture Library</h1>
        <p>Listen to or read foundational Vaishnav texts.</p>
      </header>
      {synth && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div>
            <label>Rate</label>
            <input type="range" min="0.5" max="1.5" step="0.1" value={rate} onChange={(e)=>setRate(parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Pitch</label>
            <input type="range" min="0.8" max="1.4" step="0.1" value={pitch} onChange={(e)=>setPitch(parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Volume</label>
            <input type="range" min="0.2" max="1" step="0.1" value={volume} onChange={(e)=>setVolume(parseFloat(e.target.value))} />
          </div>
        </div>
      )}

      {loading && <div>Loading scriptures...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="scripture-list">
        {scriptures.map((scripture) => (
          <ScriptureCard 
            key={scripture.scripture_id} 
            scripture={scripture}
            onSpeak={handleSpeak}
            isSpeaking={isSpeaking}
            currentlySpeakingId={currentlySpeakingId}
            rate={rate}
            pitch={pitch}
            volume={volume}
            voice={voice}
          />
        ))}
      </div>
    </div>
  );
};

export default ScriptureLibrary;