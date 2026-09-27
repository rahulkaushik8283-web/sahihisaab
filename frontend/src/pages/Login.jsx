import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { Phone, KeyRound, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginWithOtp } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await api.sendOtp(phone);
      if (res.success) {
        setOtpSent(true);
        setOtp('123456'); // Auto fill demo OTP for instant convenience
      } else {
        setError(res.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithOtp(phone, otp || '123456');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    try {
      await loginWithOtp('9876543210', '123456');
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center' }}>
      
      {/* Brand Hero */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-dark-navy)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '2rem', fontWeight: 'bold',
          boxShadow: 'var(--shadow-md)'
        }}>
          ₹
        </div>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--bg-dark-navy)' }}>{t('appName')}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          {t('tagline')}
        </p>
      </div>

      {/* Main Login Card */}
      <div className="card-pastel card-pastel-blue">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{t('login.title')}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          {t('login.subtitle')}
        </p>

        {error && (
          <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--accent-pink-bg)', color: 'var(--accent-pink)', fontSize: '0.85rem', marginBottom: '14px', fontWeight: '600' }}>
            ⚠️ {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">{t('login.phoneLabel')}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-muted)' }}>+91</span>
                <input
                  type="tel"
                  className="form-input"
                  style={{ paddingLeft: '48px' }}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <span>{loading ? 'Sending OTP...' : t('login.sendOtpBtn')}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">{t('login.otpLabel')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.25rem', fontWeight: 'bold' }}
                required
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', display: 'block', marginTop: '6px', fontWeight: '600' }}>
                ℹ️ {t('login.mockNotice')}
              </span>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <span>{loading ? 'Verifying...' : t('login.verifyBtn')}</span>
              <ShieldCheck size={18} />
            </button>
          </form>
        )}
      </div>

      {/* Quick 1-Click Pilot Demo Shortcut */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          onClick={handleQuickDemo}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '9999px',
            border: '2px dashed var(--accent-orange)',
            background: 'var(--accent-orange-bg)',
            color: '#D35400',
            fontWeight: '700',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Zap size={18} fill="#D35400" />
          <span>{t('login.demoLoginBtn')}</span>
        </button>
      </div>

    </div>
  );
};
