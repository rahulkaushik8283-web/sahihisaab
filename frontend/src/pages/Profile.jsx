import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Phone, MapPin, Briefcase, Globe, RefreshCw, LogOut, CheckCircle } from 'lucide-react';

export const Profile = () => {
  const { t, lang, setLang } = useLang();
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gigCategory, setGigCategory] = useState(user?.gig_category || 'Delivery Partner');
  const [city, setCity] = useState(user?.city || 'Delhi NCR');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setGigCategory(user.gig_category || 'Delivery Partner');
      setCity(user.city || 'Delhi NCR');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateUserProfile({
        name,
        gig_category: gigCategory,
        city
      });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Reset demo database to original 6-month historical entries?')) {
      setResetting(true);
      try {
        await api.resetDemoData();
        setMessage('Demo database refreshed! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1200);
      } catch (err) {
        setMessage('Reset failed');
      } finally {
        setResetting(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>{t('profile.title')}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage your account info and pilot demonstration settings
        </p>
      </div>

      {message && (
        <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--accent-green-bg)', color: 'var(--accent-green)', fontWeight: '700', textAlign: 'center', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {/* USER PROFILE CARD */}
      <div className="card-pastel card-pastel-blue">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div className="icon-circle icon-circle-blue" style={{ width: '54px', height: '54px', fontSize: '1.4rem' }}>
            <User size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>{user?.name || 'Rahul Sharma'}</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              +91 {user?.phone || '9876543210'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="form-label">{t('profile.nameLabel')}</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">{t('profile.gigCategoryLabel')}</label>
              <select className="form-select" value={gigCategory} onChange={(e) => setGigCategory(e.target.value)}>
                <option value="Delivery Partner">Delivery Partner</option>
                <option value="Ride-hail Driver">Ride-hail Driver</option>
                <option value="Home Services">Home Services</option>
                <option value="Other Gig Work">Other Gig Work</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('profile.cityLabel')}</label>
              <input
                type="text"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            <CheckCircle size={18} />
            <span>{saving ? 'Saving...' : t('profile.saveBtn')}</span>
          </button>
        </form>
      </div>

      {/* LANGUAGE PREFERENCE CARD */}
      <div className="card-pastel card-pastel-teal">
        <h3 style={{ fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="var(--accent-teal)" />
          <span>{t('profile.languageLabel')}</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setLang('en')}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: lang === 'en' ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
              background: lang === 'en' ? 'white' : 'rgba(255,255,255,0.5)',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            🇬🇧 English
          </button>

          <button
            type="button"
            onClick={() => setLang('hi')}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: lang === 'hi' ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
              background: lang === 'hi' ? 'white' : 'rgba(255,255,255,0.5)',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            🇮🇳 हिन्दी (Hindi)
          </button>
        </div>
      </div>

      {/* DEMO PILOT CONTROL & RESET CARD */}
      <div className="card-pastel card-pastel-orange">
        <h3 style={{ fontSize: '1rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={18} color="var(--accent-orange)" />
          <span>{t('profile.resetDemoBtn')}</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          {t('profile.resetNotice')}
        </p>

        <button
          onClick={handleResetDemoData}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '9999px',
            border: '1px solid var(--accent-orange)',
            background: 'white',
            color: '#D35400',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          disabled={resetting}
        >
          <RefreshCw size={16} />
          <span>{resetting ? 'Resetting Data...' : 'Reset to Fresh 6-Month Seed Data'}</span>
        </button>
      </div>

      {/* LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        style={{
          padding: '14px',
          borderRadius: '9999px',
          border: 'none',
          background: '#E74C3C',
          color: 'white',
          fontWeight: '700',
          fontSize: '0.95rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-sm)',
          marginTop: '8px'
        }}
      >
        <LogOut size={18} />
        <span>Log Out</span>
      </button>

    </div>
  );
};
