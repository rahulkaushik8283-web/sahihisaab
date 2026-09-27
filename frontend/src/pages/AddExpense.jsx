import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { CheckCircle, Fuel, Wrench, Smartphone, CreditCard, Package } from 'lucide-react';

export const AddExpense = () => {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [category, setCategory] = useState('Fuel');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    { label: t('expense.categories.fuel'), val: 'Fuel', icon: Fuel, color: '#F39C12' },
    { label: t('expense.categories.emi'), val: 'Vehicle EMI', icon: CreditCard, color: '#E74C3C' },
    { label: t('expense.categories.recharge'), val: 'Phone Recharge', icon: Smartphone, color: '#3498DB' },
    { label: t('expense.categories.maintenance'), val: 'Maintenance', icon: Wrench, color: '#9B59B6' },
    { label: t('expense.categories.other'), val: 'Other', icon: Package, color: '#95A5A6' },
  ];

  const presets = [150, 300, 500, 1000, 3200];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid expense amount');
      return;
    }
    setSubmitting(true);
    try {
      await api.addExpense({
        category,
        amount: parseFloat(amount),
        date,
        description
      });
      setMessage('Expense logged successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setMessage('Failed to log expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>{t('expense.title')}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Track daily operational expenses to know your real profit
        </p>
      </div>

      {message && (
        <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--accent-pink-bg)', color: 'var(--accent-pink)', fontWeight: '700', textAlign: 'center', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {/* Category Select Pills */}
      <div className="card-pastel card-pastel-pink">
        <label className="form-label">{t('expense.categoryLabel')}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = category === c.val;
            return (
              <button
                key={c.val}
                type="button"
                onClick={() => setCategory(c.val)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${c.color}` : '1px solid var(--border-light)',
                  background: isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                  color: 'var(--text-main)',
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: c.color, color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0 }}>
                  <Icon size={14} />
                </div>
                <span>{c.val}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-pastel card-pastel-orange">
        
        {/* Preset quick amount buttons */}
        <div className="form-group">
          <label className="form-label">Quick Preset Amount</label>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p.toString())}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: '1px solid var(--accent-orange)',
                  background: amount === p.toString() ? 'var(--accent-orange)' : 'white',
                  color: amount === p.toString() ? 'white' : 'var(--text-main)',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                ₹{p}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('expense.amountLabel')}</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>₹</span>
            <input
              type="number"
              step="0.01"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '1.25rem', fontWeight: 'bold' }}
              placeholder="350"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('expense.dateLabel')}</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('expense.descLabel')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Petrol for Splendor / Mobil oil"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ background: 'var(--accent-pink)' }} disabled={submitting}>
          <CheckCircle size={18} />
          <span>{submitting ? 'Saving...' : t('expense.saveBtn')}</span>
        </button>
      </form>

    </div>
  );
};
