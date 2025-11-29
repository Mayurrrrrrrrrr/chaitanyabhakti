import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './ScriptureLibrary.css';

// --- Inline Icons (No dependencies) ---
const IconBook = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
const IconArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
const IconPlay = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
const IconPause = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
const IconStop = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" /></svg>;
const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IconMinus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;

const pickTitle = (item, language) => {
  if (language === 'en') return item.title_en || item.title;
  return item.title;
};

const ScriptureLibrary = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [fontSize, setFontSize] = useState(22); // Even larger default for better readability
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);
  const [language] = useState(localStorage.getItem('appLanguage') || 'hi');

  // Load voices when they become available
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    const updateVoices = () => {
      setVoices(synth.getVoices());
    };
    updateVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }
  }, [synth]);

  useEffect(() => {
    let mounted = true;
    api.get('/scriptures')
      .then(res => { if (mounted) setBooks(res.data || []); })
      .catch(() => { });
    return () => { mounted = false; };
  }, []);

  // Stop audio on unmount or book change
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  const handleSpeak = (text) => {
    if (synth.speaking && !isPaused) {
      synth.pause();
      setIsPaused(true);
      setIsSpeaking(false);
      return;
    }

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // --- VOICE SELECTION LOGIC ---
    // Try to find a Hindi India voice first
    const hindiVoice = voices.find(v => v.lang === 'hi-IN') || voices.find(v => v.lang.includes('hi'));

    if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      // Fallback if no Hindi voice found (e.g., some older desktops)
      console.warn("Hindi voice not found, using default.");
    }

    utterance.rate = 0.85; // Comfortable reading speed
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsSpeaking(true);
  };

  const handleStop = () => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const changeFontSize = (delta) => {
    setFontSize(prev => Math.min(Math.max(prev + delta, 18), 40)); // Accessible range: 18px to 40px
  };

  // --- LIST VIEW ---
  if (!selectedBook) {
    return (
      <div className="page-container library-page">
        <div className="page-header">
          <h1 className="page-title">Scripture Library</h1>
          <p className="page-subtitle">Timeless wisdom for your soul</p>
        </div>

        <div className="books-grid">
          {(books || []).map(book => (
            <div key={book.scripture_id} className="book-card" onClick={() => setSelectedBook(book)}>
              <div className="book-cover" style={{ background: '#f6d365' }}>
                <div className="book-spine"></div>
                <span className="cover-title">{pickTitle(book, language)}</span>
              </div>
              <div className="book-info">
                <h3 className="book-title-text">{pickTitle(book, language)}</h3>
                <p className="book-author">{book.author}</p>
                <p className="book-summary">{book.description}</p>
                <button className="btn-read">Read Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- READER VIEW ---
  return (
    <div className="page-container reader-page">
      {/* Floating Toolbar */}
      <div className="reader-toolbar card">
        <button className="toolbar-btn back-btn" onClick={() => { setSelectedBook(null); handleStop(); }}>
          <IconArrowLeft /> <span className="btn-label">Library</span>
        </button>

        <div className="toolbar-group font-controls">
          <button className="toolbar-btn icon-only" onClick={() => changeFontSize(-2)} title="Decrease Text Size">
            <IconMinus />
          </button>
          <span className="font-indicator">A</span>
          <button className="toolbar-btn icon-only" onClick={() => changeFontSize(2)} title="Increase Text Size">
            <IconPlus />
          </button>
        </div>

        <div className="toolbar-group audio-controls">
          {isSpeaking ? (
            <button className="toolbar-btn active-pulse" onClick={() => handleSpeak(selectedBook.description || '')}>
              <IconPause /> <span className="btn-label">Pause</span>
            </button>
          ) : (
            <button className="toolbar-btn" onClick={() => handleSpeak(selectedBook.description || '')}>
              <IconPlay /> <span className="btn-label">Listen</span>
            </button>
          )}
          {(isSpeaking || isPaused) && (
            <button className="toolbar-btn" onClick={handleStop} title="Stop Audio">
              <IconStop />
            </button>
          )}
        </div>
      </div>

      {/* Content Display */}
      <div className="reader-content-wrapper">
        <div className="card reader-paper">
          <h2 className="chapter-title">{selectedBook.title}</h2>
          <p className="chapter-author">{selectedBook.author}</p>
          <div className="chapter-divider"></div>

          <div
            className="chapter-text"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
          >
            {selectedBook.description && selectedBook.description.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {(selectedBook.content_url || selectedBook.audio_url) && (
            <div className="reader-footer">
              {selectedBook.content_url && (
                <a className="btn-nav-chapter" href={selectedBook.content_url} target="_blank" rel="noreferrer">Open PDF</a>
              )}
              {selectedBook.audio_url && (
                <audio controls src={selectedBook.audio_url} style={{ marginLeft: 12 }} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptureLibrary;