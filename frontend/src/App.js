import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const saveToken = (userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* If not logged in, show Login page */}
          {!token ? (
            <Route path="/login" element={<Login setToken={saveToken} />} />
          ) : (
            /* If logged in, show Dashboard as main page */
            <>
              <Route path="/dashboard" element={<Dashboard />} />
            </>
          )}

          {/* Redirect logic */}
          <Route 
            path="*"
            element={<Navigate to={token ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;