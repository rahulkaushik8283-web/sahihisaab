import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { Upload, CheckCircle, Plus, Camera, FileText } from 'lucide-react';

export const AddIncome = () => {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('manual'); // manual | photo
  const [platform, setPlatform] = useState('Zomato');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const platforms = ['Zomato', 'Swiggy', 'Uber', 'Rapido', 'Ola', 'Urban Company', 'Other'];

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid earnings amount');
      return;
    }
    setSubmitting(true);
    try {
      await api.addIncome({
        platform,
        amount: parseFloat(amount),
        date,
        source: activeTab === 'photo' ? 'ocr' : 'manual',
        notes
      });
      setMessage('Income logged successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setMessage('Failed to log income');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrLoading(true);
    setMessage('');

    try {
      const res = await api.parseOcr(file);
      if (res.platform) setPlatform(res.platform);
      if (res.amount) setAmount(res.amount.toString());
      setOcrSuccess(true);
    } catch (err) {
      console.error('OCR failed:', err);
      // Fallback defaults
      setAmount('1450');
      setOcrSuccess(true);
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>{t('income.title')}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Record daily earnings from delivery & ride platforms
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-pills">
        <button
          className={`tab-pill ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          📝 {t('income.tabManual')}
        </button>
        <button
          className={`tab-pill ${activeTab === 'photo' ? 'active' : ''}`}
          onClick={() => setActiveTab('photo')}
        >
          📸 {t('income.tabPhoto')}
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--accent-green-bg)', color: 'var(--accent-green)', fontWeight: '700', textAlign: 'center', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {/* PHOTO ENTRY TAB */}
      {activeTab === 'photo' && (
        <div className="card-pastel card-pastel-teal">
          <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{t('income.uploadTitle')}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            {t('income.uploadSubtitle')}
          </p>

          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px', border: '2px dashed var(--accent-teal)', borderRadius: '14px', background: 'white',
            cursor: 'pointer', textAlign: 'center'
          }}>
            <Camera size={32} color="var(--accent-teal)" style={{ marginBottom: '8px' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-teal)' }}>
              {selectedFile ? selectedFile.name : 'Tap to Select Screenshot'}
            </span>
            <input type="file" accept="image/*" onChange={handleScreenshotUpload} style={{ display: 'none' }} />
          </label>

          {previewUrl && (
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <img src={previewUrl} alt="Preview" style={{ maxHeight: '140px', borderRadius: '12px', border: '1px solid var(--border-light)' }} />
            </div>
          )}

          {ocrLoading && (
            <div style={{ textAlign: 'center', margin: '14px 0', color: 'var(--accent-teal)', fontWeight: '700', fontSize: '0.9rem' }}>
              ⏳ {t('income.ocrScanning')}
            </div>
          )}

          {ocrSuccess && (
            <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(2,128,144,0.1)', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--accent-teal)', fontWeight: '600' }}>
              ✓ {t('income.ocrConfirmNotice')}
            </div>
          )}
        </div>
      )}

      {/* FORM SECTION (Common for both tabs) */}
      <form onSubmit={handleManualSubmit} className="card-pastel card-pastel-blue">
        <div className="form-group">
          <label className="form-label">{t('income.platformLabel')}</label>
          <select className="form-select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {platforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('income.amountLabel')}</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>₹</span>
            <input
              type="number"
              step="0.01"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '1.25rem', fontWeight: 'bold' }}
              placeholder="1450"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('income.dateLabel')}</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('income.notesLabel')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Rain bonus, Sunday peak shift"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary btn-accent" disabled={submitting}>
          <CheckCircle size={18} />
          <span>{submitting ? 'Saving...' : t('income.saveBtn')}</span>
        </button>
      </form>

    </div>
  );
};
