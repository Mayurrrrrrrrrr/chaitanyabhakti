import React, { useState } from 'react';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext'; // <-- CORRECTED PATH

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
      const response = await api.post('/auth/send-otp', { mobile_number: mobileNumber });
      
      console.log('Test OTP:', response.data.otp); 
      setStep(2); 
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
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
          setError('This is a new user. Please provide your name.');
        } else {
          setError('Invalid or expired OTP.');
        }
      } else {
        setError('Verification failed. Please try again.');
      }
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Hare Krishna! 🙏</h1>
      <h2 style={styles.subtitle}>Welcome to Vaishnav Bhakti</h2>
      {error && <p style={styles.error}>{error}</p>}
      
      {step === 1 && (
        <div style={styles.form}>
          <label style={styles.label}>Mobile Number</label>
          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="+919876543210"
            style={styles.input}
          />
          <button onClick={handleSendOtp} style={styles.button}>
            Send OTP
          </button>
        </div>
      )}
      
      {step === 2 && (
        <div style={styles.form}>
          <label style={styles.label}>Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            style={styles.input}
          />
          <label style={styles.label}>Your Name (if new user)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mayur Das"
            style={styles.input}
          />
          <button onClick={handleVerifyOtp} style={styles.button}>
            Login
          </button>
        </div>
      )}
    </div>
  );
};

// Basic styling for now
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f4',
  },
  title: {
    color: '#d9534f',
    fontSize: '2.5rem',
  },
  subtitle: {
    color: '#555',
    fontSize: '1.2rem',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
  },
  label: {
    marginBottom: '5px',
    color: '#333',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  button: {
    padding: '12px',
    fontSize: '1rem',
    color: 'white',
    backgroundColor: '#0275d8',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
  }
};

export default Login;