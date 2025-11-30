// frontend/src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './LoginPage.css';

const LoginPage = () => {
  const [loginMode, setLoginMode] = useState('otp');
  const [step, setStep] = useState(1);
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

  // ... (Keep handleSendOTP, handleVerifyOTP, handlePasswordLogin, resetForm logic exactly as is)
  const handleSendOTP = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await api.sendOtp({ mobile_number: mobileNumber });
      if (response.data.success) { setSentOtp(response.data.otp); setStep(2); }
    } catch (err) { setError(err.response?.data?.error || 'Failed to send OTP'); } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await api.verifyOtp({ mobile_number: mobileNumber, otp: otp, name: name || undefined, spiritual_name: spiritualName || undefined });
      if (response.data.success) {
        login(response.data.token, response.data.user);
        navigate(response.data.user?.is_super_admin ? '/admin' : '/dashboard');
      }
    } catch (err) { setError(err.response?.data?.error || 'OTP verification failed'); } finally { setLoading(false); }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await api.login({ mobile_number: mobileNumber, password: password });
      if (response.data.success) {
        login(response.data.token, response.data.user);
        navigate(response.data.user?.is_super_admin ? '/admin' : '/dashboard');
      }
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setStep(1); setMobileNumber(''); setOtp(''); setPassword(''); setName(''); setSpiritualName(''); setError(''); setSentOtp('');
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <div className="login-header">
          <h1>🕉️</h1>
          <h2>Vaishnav Bhakti</h2>
          <p className="subtitle">Your spiritual companion</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="mode-toggle">
          <button className={loginMode === 'otp' ? 'active' : ''} onClick={() => { setLoginMode('otp'); resetForm(); }}>OTP Login</button>
          <button className={loginMode === 'password' ? 'active' : ''} onClick={() => { setLoginMode('password'); resetForm(); }}>Password</button>
        </div>

        <div className="login-form-wrapper">
          {loginMode === 'otp' && (
            <>
              {step === 1 ? (
                <form onSubmit={handleSendOTP}>
                  <div className="form-group">
                    <input type="tel" className="input-field" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn-primary full-width" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP}>
                  <div className="form-group">
                    <input type="text" className="input-field" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength="6" />
                    {sentOtp && <div className="test-otp-hint">Test OTP: {sentOtp}</div>}
                  </div>
                  <div className="form-group">
                    <input type="text" className="input-field" placeholder="Name (New User)" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <input type="text" className="input-field" placeholder="Spiritual Name (Optional)" value={spiritualName} onChange={(e) => setSpiritualName(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary full-width" disabled={loading}>{loading ? 'Verifying...' : 'Verify & Login'}</button>
                  <button type="button" onClick={resetForm} className="btn-text">Change Number</button>
                </form>
              )}
            </>
          )}

          {loginMode === 'password' && (
            <form onSubmit={handlePasswordLogin}>
              <div className="form-group">
                <input type="tel" className="input-field" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
              </div>
              <div className="form-group">
                <input type="password" className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary full-width" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;