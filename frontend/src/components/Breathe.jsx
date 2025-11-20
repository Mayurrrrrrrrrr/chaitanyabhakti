import React, { useState } from 'react';

const Breathe = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="page-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header" style={{ paddingBottom: 0 }}>
        <h1 className="page-title">Breath Exercise</h1>
        <p className="page-subtitle">Focus and calm the mind</p>
      </header>

      {!loaded && (
        <div className="card" style={{ marginTop: 12 }}>
          <p>Loading breath exercise...</p>
          <p>If this stays blank, place your files under <code>/public/breathe/</code> as <code>/breathe/index.html</code>.</p>
        </div>
      )}

      <div className="card" style={{ flex: 1, display: 'flex' }}>
        <iframe
          title="Breath Exercise"
          src="/breathe/dist/index.html"
          style={{ border: 'none', width: '100%', height: '70vh', borderRadius: 12 }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
};

export default Breathe;