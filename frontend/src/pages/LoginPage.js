// frontend/src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Correct path
import api from '../utils/api';
import './LoginPage.css';

const LoginPage = () => {
  const [loginMode, setLoginMode] = useState('otp'); // 'otp' or 'password'
  const [step, setStep] = useState(1); // 1: enter mobile, 2: enter OTP/password
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [spiritualName, setSpiritualName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentOtp, setSentOtp] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/send-otp', { mobile_number: mobileNumber });
      
      if (response.data.success) {
        setSentOtp(response.data.otp); // For testing - remove in production
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', {
        mobile_number: mobileNumber,
        otp: otp,
        name: name || undefined,
        spiritual_name: spiritualName || undefined,
      });

      if (response.data.success) {
        login(response.data.token, response.data.user);
        if (response.data.user?.is_super_admin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        mobile_number: mobileNumber,
        password: password,
      });

      if (response.data.success) {
        login(response.data.token, response.data.user);
        if (response.data.user?.is_super_admin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setMobileNumber('');
    setOtp('');
    setPassword('');
    setName('');
    setSpiritualName('');
    setError('');
    setSentOtp('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🕉️ Vaishnav Bhakti</h1>
        <p className="subtitle">Welcome to your spiritual journey</p>

        {error && <div className="error-message">{error}</div>}

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={loginMode === 'otp' ? 'active' : ''}
            onClick={() => { setLoginMode('otp'); resetForm(); }}
          >
            Login with OTP
          </button>
          <button
            className={loginMode === 'password' ? 'active' : ''}
            onClick={() => { setLoginMode('password'); resetForm(); }}
          >
            Login with Password
          </button>
        </div>

        {/* OTP Login Flow */}
        {loginMode === 'otp' && (
          <>
            {step === 1 ? (
              <form onSubmit={handleSendOTP}>
                <input
                  type="tel"
                  placeholder="Enter 10-digit Mobile Number" // Updated placeholder
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength="6"
                />
                
                {sentOtp && (
                  <div className="test-otp">
                    Test OTP: <strong>{sentOtp}</strong>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Your Name (for new users)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Spiritual Name (optional)"
                  value={spiritualName}
                  onChange={(e) => setSpiritualName(e.target.value)}
                />
                
                <button type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                
                <button type="button" onClick={resetForm} className="back-btn">
                  Back
                </button>
              </form>
            )}
          </>
        )}

        {/* Password Login Flow */}
        {loginMode === 'password' && (
          <form onSubmit={handlePasswordLogin}>
            <input
              type="tel"
              placeholder="Mobile Number (e.g., +91...)" // ✅ Updated placeholder
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              // ✅ REMOVED pattern and maxLength to allow +91 format
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;