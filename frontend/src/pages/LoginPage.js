// frontend/src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { FiSmartphone, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-4 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white/20">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-700 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-center opacity-5 bg-no-repeat bg-contain" style={{ backgroundImage: "url('/logo192.png')" }}></div>
          <img src="/logo192.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
          <h2 className="font-heading text-2xl font-bold tracking-wide">Vaishnav Bhakti</h2>
          <p className="text-primary-100 text-sm mt-1">Your Spiritual Companion</p>
        </div>

        <div className="p-8">
          {/* Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === 'otp' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setLoginMode('otp'); resetForm(); }}
            >
              OTP Login
            </button>
            <button
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === 'password' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setLoginMode('password'); resetForm(); }}
            >
              Password
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 flex items-center gap-2 animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* Forms */}
          <div className="space-y-4">
            {loginMode === 'otp' && (
              <>
                {step === 1 ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="relative">
                      <FiSmartphone className="absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="tel"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                        placeholder="Mobile Number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2" disabled={loading}>
                      {loading ? 'Sending...' : <>Send OTP <FiArrowRight /></>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fadeIn">
                    <div className="relative">
                      <FiLock className="absolute left-4 top-3.5 text-slate-400" />
                      <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength="6" />
                    </div>
                    {sentOtp && <div className="text-xs text-green-600 text-center bg-green-50 py-1 rounded">Test OTP: {sentOtp}</div>}

                    <div className="relative">
                      <FiUser className="absolute left-4 top-3.5 text-slate-400" />
                      <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Name (New User)" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Spiritual Name (Optional)" value={spiritualName} onChange={(e) => setSpiritualName(e.target.value)} />

                    <button type="submit" className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-secondary-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                    <button type="button" onClick={resetForm} className="w-full text-slate-500 text-sm hover:text-primary-600 transition-colors">Change Number</button>
                  </form>
                )}
              </>
            )}

            {loginMode === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4 animate-fadeIn">
                <div className="relative">
                  <FiSmartphone className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="tel" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="password" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;