import React, { useState } from 'react';

const Breathe = () => {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="page-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header" style={{ paddingBottom: 0 }}>
        <h1 className="page-title">Breath Exercise</h1>
        <p className="page-subtitle">Focus and calm the mind</p>
      </header>

      {!loaded && !hasError && (
        <div className="card" style={{ marginTop: 12 }}>
          <p>Loading breath exercise...</p>
          <p>If this stays blank, ensure files exist under <code>/public/breathe/dist/</code> as <code>/breathe/dist/index.html</code>.</p>
        </div>
      )}

      {hasError && (
        <div className="card" style={{ marginTop: 12 }}>
          <p>Unable to load breath exercise content.</p>
          <p>Check that <code>/public/breathe/dist/index.html</code> and its assets are present.</p>
        </div>
      )}

      <div className="card" style={{ flex: 1, display: 'flex' }}>
        <iframe
          title="Breath Exercise"
          src="/breathe/dist/index.html"
          style={{ border: 'none', width: '100%', height: '70vh', borderRadius: 12 }}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setHasError(true);
          }}
        />
      </div>
    </div>
  );
};

export default Breathe;