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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron-600 via-orange-600 to-orange-700 p-4 relative overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0 bg-vrindavan bg-cover bg-center opacity-20"></div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-orange-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border-4 border-white/50">

        {/* Header */}
        <div className="bg-gradient-to-r from-saffron-500 to-orange-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-peacock bg-cover bg-center opacity-10"></div>
          <div className="relative z-10">
            <img src="/logo192.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 drop-shadow-2xl" />
            <h2 className="font-heading text-3xl font-bold tracking-wide mb-2">Chaitanya Bhakti</h2>
            <p className="text-white/90 text-sm">🙏 Your Spiritual Companion 🙏</p>
          </div>
        </div>

        <div className="p-8">
          {/* Toggle */}
          <div className="flex bg-gradient-to-r from-orange-100 to-yellow-100 p-1 rounded-2xl mb-8 shadow-inner">
            <button
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${loginMode === 'otp' ? 'bg-white text-saffron-600 shadow-lg' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => { setLoginMode('otp'); resetForm(); }}
            >
              OTP Login
            </button>
            <button
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${loginMode === 'password' ? 'bg-white text-saffron-600 shadow-lg' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => { setLoginMode('password'); resetForm(); }}
            >
              Password
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 border-2 border-red-200 flex items-center gap-2">
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
                      <FiSmartphone className="absolute left-4 top-4 text-saffron-500" size={20} />
                      <input
                        type="tel"
                        className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all font-medium"
                        placeholder="Mobile Number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-saffron-500 to-orange-600 hover:from-saffron-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2" disabled={loading}>
                      {loading ? 'Sending...' : <>Send OTP <FiArrowRight /></>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="relative">
                      <FiLock className="absolute left-4 top-4 text-saffron-500" size={20} />
                      <input type="text" className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength="6" />
                    </div>
                    {sentOtp && <div className="text-xs text-green-600 text-center bg-green-50 py-2 rounded-lg border border-green-200">Test OTP: <strong>{sentOtp}</strong></div>}

                    <div className="relative">
                      <FiUser className="absolute left-4 top-4 text-saffron-500" size={20} />
                      <input type="text" className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500" placeholder="Name (New User)" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <input type="text" className="w-full px-4 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500" placeholder="Spiritual Name (Optional)" value={spiritualName} onChange={(e) => setSpiritualName(e.target.value)} />

                    <button type="submit" className="w-full bg-gradient-to-r from-saffron-500 to-orange-600 hover:from-saffron-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                    <button type="button" onClick={resetForm} className="w-full text-saffron-600 text-sm hover:text-saffron-700 transition-colors font-medium">Change Number</button>
                  </form>
                )}
              </>
            )}

            {loginMode === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="relative">
                  <FiSmartphone className="absolute left-4 top-4 text-saffron-500" size={20} />
                  <input type="tel" className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-4 text-saffron-500" size={20} />
                  <input type="password" className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-saffron-500 to-orange-600 hover:from-saffron-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 text-center border-t-2 border-orange-200">
          <p className="text-saffron-700 text-sm italic font-medium">
            "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare"
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;