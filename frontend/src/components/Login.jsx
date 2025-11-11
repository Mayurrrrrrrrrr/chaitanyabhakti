// frontend/src/components/Login.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Login.css';

const Login = () => {
  const [loginMode, setLoginMode] = useState('otp');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get isAuthenticated and user from useAuth
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  //
  // --- THIS IS THE MAIN FIX ---
  // This effect will run AFTER login() successfully updates the state.
  //
  useEffect(() => {
    if (isAuthenticated) {
      // Once authenticated, check if admin and navigate to the correct page
      if (user && user.is_super_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]); // Dependencies

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Use the correct path (no /api)
      await api.post('/auth/send-otp', { mobile_number: mobileNumber });
      setShowOtpInput(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Use the correct path (no /api)
      const res = await api.post('/auth/verify-otp', { mobile_number: mobileNumber, otp });
      
      // Only call login. The useEffect will handle navigation.
      login(res.data); 
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    }
    setLoading(false);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Use the correct path (no /api)
      const res = await api.post('/auth/login', { mobile_number: mobileNumber, password });
      
      // Only call login. The useEffect will handle navigation.
      login(res.data);

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{loginMode === 'otp' ? 'Login with OTP' : 'Admin Login'}</h2>
        {error && <p className="error-message">{error}</p>}

        {loginMode === 'otp' ? (
          // --- OTP LOGIN FORM ---
          !showOtpInput ? (
            <form onSubmit={handleSendOtp}>
              <div className="input-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="tel"
                  id="mobile"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <p>Enter OTP sent to {mobileNumber}</p>
              <div className="input-group">
                <label htmlFor="otp">OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
          )
        ) : (
          // --- PASSWORD LOGIN FORM ---
          <form onSubmit={handlePasswordLogin}>
            <div className="input-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter admin mobile number"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        <button 
          className="btn-toggle-mode"
          onClick={() => {
            setLoginMode(loginMode === 'otp' ? 'password' : 'otp');
            setError('');
          }}
        >
          {loginMode === 'otp' ? 'Switch to Admin Login' : 'Switch to User Login (OTP)'}
        </button>
      </div>
    </div>
  );
};

export default Login;