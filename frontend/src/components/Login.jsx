import React, { useState } from 'react';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import './Login.css'; // हम इस पेज के लिए एक अलग CSS बनाएँगे

const Login = () => {
  const { login } = useAuth(); 

  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); 
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    try {
      setError('');
      if (!mobileNumber || mobileNumber.length < 10) {
        setError('कृपया सही मोबाइल नंबर दर्ज करें।');
        return;
      }
      const response = await api.post('/auth/send-otp', { mobile_number: mobileNumber });
      
      console.log('Test OTP:', response.data.otp); 
      setStep(2); 
    } catch (err) {
      setError('OTP भेजने में विफल। कृपया पुनः प्रयास करें।');
      console.error(err);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError('');
      const response = await api.post('/auth/verify-otp', { 
        mobile_number: mobileNumber, 
        otp: otp,
        name: name 
      });

      if (response.data.success && response.data.token) {
        login(response.data.token, response.data.user);
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        if (err.response.data.error.includes('Name required')) {
          setError('यह एक नया नंबर है। कृपया अपना नाम दर्ज करें।');
        } else {
          setError('अमान्य या समाप्त हो गया OTP।');
        }
      } else {
        setError('सत्यापन विफल। कृपया पुनः प्रयास करें।');
      }
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      {/* हम यहाँ ऐप का लोगो लगा सकते हैं */}
      <h1 className="login-title">चैतन्य भक्ति</h1>
      <h2 className="login-subtitle">परिवार संग, भक्ति के रंग</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      {step === 1 && (
        <div className="form-container">
          <div className="form-group">
            <label className="form-label" htmlFor="mobile">मोबाइल नंबर</label>
            <input
              id="mobile"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="अपना १० अंकों का मोबाइल नंबर दर्ज करें"
              className="form-input"
            />
          </div>
          <button onClick={handleSendOtp} className="btn btn-primary">
            OTP भेजें
          </button>
        </div>
      )}
      
      {step === 2 && (
        <div className="form-container">
          <div className="form-group">
            <label className="form-label" htmlFor="otp">OTP दर्ज करें</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6 अंकों का OTP"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="name">आपका नाम (यदि नए उपयोगकर्ता हैं)</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="जैसे: मयूर दास"
              className="form-input"
            />
          </div>
          <button onClick={handleVerifyOtp} className="btn btn-primary">
            लॉग इन करें
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;