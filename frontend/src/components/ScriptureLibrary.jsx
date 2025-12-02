import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../services/api';
import './ScriptureLibrary.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// --- Inline Icons (No dependencies) ---
const IconBook = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
const IconArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
const IconPlay = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
const IconPause = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
const IconStop = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" /></svg>;
const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IconMinus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IconChevronLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>;
const IconChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;

const pickTitle = (item, language) => {
  if (language === 'en') return item.title_en || item.title;
  return item.title;
};

const ScriptureLibrary = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [fontSize, setFontSize] = useState(22);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // PDF viewer states
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);

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

    const hindiVoice = voices.find(v => v.lang === 'hi-IN') || voices.find(v => v.lang.includes('hi'));

    if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      console.warn("Hindi voice not found, using default.");
    }

    utterance.rate = 0.85;
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
    setFontSize(prev => Math.min(Math.max(prev + delta, 18), 40));
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(prevPageNumber + offset, 1), numPages));
  };

  const changeScale = (delta) => {
    setPdfScale(prev => Math.min(Math.max(prev + delta, 0.5), 2.0));
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
              <div className="book-cover" style={{ background: 'linear-gradient(135deg, #27ae60, #3498db, #f1c40f)' }}>
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
        <button className="toolbar-btn back-btn" onClick={() => { setSelectedBook(null); handleStop(); setPageNumber(1); }}>
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

          {/* PDF Viewer Section */}
          {selectedBook.content_url && selectedBook.content_url.endsWith('.pdf') && (
            <div className="pdf-viewer-section">
              <div className="pdf-controls">
                <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="pdf-nav-btn">
                  <IconChevronLeft /> Previous
                </button>
                <span className="pdf-page-info">
                  Page {pageNumber} of {numPages || '...'}
                </span>
                <button onClick={() => changePage(1)} disabled={pageNumber >= numPages} className="pdf-nav-btn">
                  Next <IconChevronRight />
                </button>
                <div className="pdf-zoom-controls">
                  <button onClick={() => changeScale(-0.1)} className="pdf-zoom-btn"><IconMinus /></button>
                  <span className="pdf-zoom-level">{Math.round(pdfScale * 100)}%</span>
                  <button onClick={() => changeScale(0.1)} className="pdf-zoom-btn"><IconPlus /></button>
                </div>
              </div>
              <div className="pdf-document-container">
                <Document
                  file={selectedBook.content_url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="pdf-loading">Loading PDF...</div>}
                  error={<div className="pdf-error">Failed to load PDF. <a href={selectedBook.content_url} target="_blank" rel="noreferrer">Open in new tab</a></div>}
                >
                  <Page pageNumber={pageNumber} scale={pdfScale} />
                </Document>
              </div>
            </div>
          )}

          {(selectedBook.content_url || selectedBook.audio_url) && (
            <div className="reader-footer">
              {selectedBook.content_url && !selectedBook.content_url.endsWith('.pdf') && (
                <a className="btn-nav-chapter" href={selectedBook.content_url} target="_blank" rel="noreferrer">Open Content</a>
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