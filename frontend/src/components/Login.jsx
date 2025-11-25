import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Login.css';

const Login = () => {
  const [loginMode, setLoginMode] = useState('otp');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // We check for user existence here to be safe
      if (user && user.is_super_admin) {
        navigate('/admin');
      } else if (user) { // only navigate if user is not null
        navigate('/dashboard');
      }
    }
    // ✅ FIX: Add 'user' to the dependency array.
    // This ensures this effect runs *after* the user state is set
    // from the login function and correctly navigates based on
    // the NEW user object.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, navigate]); // <-- ADD 'user' HERE

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.sendOtp({ mobile_number: mobileNumber });
      setShowOtpInput(true);
      if (res.data.otp) {
        setOtpSent(res.data.otp);
        console.log('OTP:', res.data.otp);
      }
    } catch (err) {
      console.error('Send OTP Error:', err);
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🛑 FIX: Send correct payload
      const payload = {
        mobile_number: mobileNumber,
        otp: otp
      };

      // Only include name if it's a new user (name field is filled)
      if (name && name.trim()) {
        payload.name = name.trim();
      }

      console.log('Verifying OTP with payload:', payload);

      const res = await api.verifyOtp(payload);

      console.log('Verify OTP Response:', res.data);

      if (res.data.success && res.data.token) {
        login(res.data); // Pass the entire response
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      console.error('Error Response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login({
        mobile_number: mobileNumber,
        password: password
      });

      if (res.data.success && res.data.token) {
        login(res.data);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Password Login Error:', err);
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="om-symbol">ॐ</div>
          <h1 className="login-title">Vaishnav Bhakti</h1>
          <p className="login-subtitle">हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे</p>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {loginMode === 'otp' ? (
          !showOtpInput ? (
            <form onSubmit={handleSendOtp} className="login-form">
              <h2>Login with OTP</h2>
              <div className="input-group">
                <label htmlFor="mobile">📱 Mobile Number</label>
                <input
                  type="tel"
                  id="mobile"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  required
                  maxLength="10"
                  pattern="[0-9]{10}"
                />
                <small style={{ color: '#636E72', fontSize: '0.85rem' }}>
                  Use: 9999999999 (existing user)
                </small>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Sending...' : '📲 Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="login-form">
              <h2>Verify OTP</h2>
              <p className="otp-info">OTP sent to <strong>{mobileNumber}</strong></p>

              {otpSent && (
                <div className="dev-otp-display">
                  <p>🔑 Your OTP: <strong>{otpSent}</strong></p>
                  <small>(For development only)</small>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="otp">🔐 Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  required
                  maxLength="6"
                  pattern="[0-9]{6}"
                />
              </div>

              <div className="input-group">
                <label htmlFor="name">👤 Your Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Only for NEW users"
                />
                <small style={{ color: '#636E72', fontSize: '0.85rem' }}>
                  Leave empty if you're an existing user
                </small>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Verifying...' : '✅ Verify & Login'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp('');
                  setOtpSent('');
                  setName('');
                }}
              >
                ← Change Number
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handlePasswordLogin} className="login-form">
            <h2>Admin Login</h2>
            <div className="input-group">
              <label htmlFor="mobile">📱 Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Admin mobile number"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">🔒 Password</label>
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
              {loading ? '⏳ Logging in...' : '🚀 Login'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <button
            className="btn-toggle-mode"
            onClick={() => {
              setLoginMode(loginMode === 'otp' ? 'password' : 'otp');
              setError('');
              setShowOtpInput(false);
              setMobileNumber('');
              setPassword('');
              setOtp('');
              setName('');
            }}
          >
            {loginMode === 'otp' ? '🔐 Admin Login' : '📱 User Login (OTP)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;