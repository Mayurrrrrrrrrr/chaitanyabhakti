import React, { useState, useEffect, useRef } from 'react';
import './ScriptureLibrary.css';

// --- Inline Icons (No dependencies) ---
const IconBook = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IconPlay = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IconPause = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const IconStop = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12"/></svg>;
const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconMinus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;

// --- Updated Sample Data with Hindi Content ---
const SAMPLE_BOOKS = [
  {
    id: 1,
    title: "श्रीमद्भगवद्गीता यथारूप",
    author: "ए.सी. भक्तिवेदांत स्वामी प्रभुपाद",
    color: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    summary: "कुरुक्षेत्र के युद्ध के मैदान में अर्जुन को भगवान कृष्ण का कालातीत ज्ञान।",
    content: `अध्याय १: कुरुक्षेत्र के युद्धस्थल में सैन्यनिरीक्षण

    धृतराष्ट्र ने कहा — हे संजय! धर्मभूमि कुरुक्षेत्र में युद्ध की इच्छा से एकत्र हुए मेरे तथा पाण्डु के पुत्रों ने क्या किया?

    संजय ने कहा — हे राजा! पाण्डुपुत्रों द्वारा सेना की व्यूहरचना देखकर राजा दुर्योधन अपने गुरु के पास गया और उसने ये शब्द कहे।

    हे आचार्य! पाण्डुपुत्रों की विशाल सेना को देखें, जिसे आपके बुद्धिमान शिष्य द्रुपदपुत्र ने इतने कौशल से व्यवस्थित किया है। इस सेना में भीम तथा अर्जुन के समान युद्ध करने वाले अनेक वीर धनुर्धर हैं — यथा महारथी युयुधान, विराट तथा द्रुपद।`
  },
  {
    id: 2,
    title: "श्रीमद् भागवतम्",
    author: "वेद व्यास",
    color: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    summary: "विष्णु के अवतारों का इतिहास और महान भक्तों का जीवन।",
    content: `स्कंध १, अध्याय १: मुनियों की जिज्ञासा

    हे प्रभु, हे श्रीकृष्ण, हे वसुदेवपुत्र, हे सर्वव्यापी भगवान, मैं आपको सादर नमस्कार करता हूँ। मैं भगवान श्रीकृष्ण का ध्यान करता हूँ क्योंकि वे परम सत्य हैं और सृष्टि की उत्पत्ति, पालन और संहार के आदि कारण हैं। वे प्रत्यक्ष और अप्रत्यक्ष रूप से सभी अभिव्यक्तियों के ज्ञाता हैं और वे पूर्ण रूप से स्वतंत्र हैं क्योंकि उनसे परे कोई अन्य कारण नहीं है।

    केवल उन्होंने ही आदि जीव ब्रह्माजी के हृदय में वैदिक ज्ञान का संचार किया। उनके द्वारा बड़े-बड़े मुनि और देवता भी मोहग्रस्त हो जाते हैं, जिस प्रकार अग्नि में जल या जल में स्थल देखकर कोई भ्रमित हो जाता है।`
  },
  {
    id: 3,
    title: "श्री ईशोपनिषद",
    author: "वैदिक शास्त्र",
    color: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    summary: "ज्ञान जो भगवान के करीब लाता है।",
    content: `मंगलाचरण

    ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते।
    पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥

    भगवान पूर्ण और परिपूर्ण हैं, और चूँकि वे पूरी तरह से पूर्ण हैं, इसलिए उनसे होने वाले सभी उद्भव, जैसे कि यह अभूतपूर्व संसार, पूर्ण रूप से पूर्ण इकाइयों के रूप में सुसज्जित हैं। पूर्ण से जो कुछ भी उत्पन्न होता है वह भी अपने आप में पूर्ण होता है। चूँकि वे पूर्ण हैं, इसलिए भले ही उनसे इतनी सारी पूर्ण इकाइयाँ निकलती हैं, फिर भी वे पूर्ण शेष रहते हैं।`
  }
];

const ScriptureLibrary = () => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [fontSize, setFontSize] = useState(22); // Even larger default for better readability
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);

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
          {SAMPLE_BOOKS.map(book => (
            <div key={book.id} className="book-card" onClick={() => setSelectedBook(book)}>
              <div className="book-cover" style={{ background: book.color }}>
                <div className="book-spine"></div>
                <span className="cover-title">{book.title}</span>
              </div>
              <div className="book-info">
                <h3 className="book-title-text">{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <p className="book-summary">{book.summary}</p>
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
                <button className="toolbar-btn active-pulse" onClick={() => handleSpeak(selectedBook.content)}>
                   <IconPause /> <span className="btn-label">Pause</span>
                </button>
            ) : (
                <button className="toolbar-btn" onClick={() => handleSpeak(selectedBook.content)}>
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
                {selectedBook.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                ))}
            </div>
            
            {/* Navigation Footer inside Reader */}
            <div className="reader-footer">
                <button className="btn-nav-chapter" disabled>Previous Chapter</button>
                <button className="btn-nav-chapter">Next Chapter</button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ScriptureLibrary;