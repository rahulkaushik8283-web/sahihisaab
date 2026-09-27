import React from 'react';
import { X, ExternalLink, CheckCircle } from 'lucide-react';
import { useLang } from '../context/LangContext';

export const EnrollmentModal = ({ scheme, onClose, onToggleEnroll }) => {
  const { lang, t } = useLang();
  if (!scheme) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {scheme.category}
            </span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '2px' }}>
              {lang === 'hi' ? scheme.title_hi : scheme.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={22} />
          </button>
        </div>

        <div className="card-pastel card-pastel-teal" style={{ padding: '14px', marginBottom: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.4', fontWeight: '500' }}>
            💡 <strong>Benefit:</strong> {lang === 'hi' ? scheme.benefit_hi : scheme.benefit}
          </p>
        </div>

        <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>
          {lang === 'hi' ? 'आवेदन करने के आसान चरण:' : 'Step-by-Step Enrollment Guide:'}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {scheme.steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.88rem' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-dark-navy)', color: 'white',
                display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.78rem', fontWeight: 'bold', flexShrink: 0
              }}>
                {idx + 1}
              </div>
              <div style={{ color: 'var(--text-main)', lineHeight: '1.35', paddingTop: '2px' }}>
                {step}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href={scheme.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <span>{lang === 'hi' ? 'सरकारी पोर्टल खोलें' : 'Go to Official Govt Portal'}</span>
            <ExternalLink size={16} />
          </a>

          <button
            onClick={() => {
              onToggleEnroll(scheme.code, !scheme.enrolled);
              onClose();
            }}
            style={{
              padding: '12px',
              borderRadius: '9999px',
              border: '1px solid var(--border-light)',
              background: scheme.enrolled ? 'var(--accent-green-bg)' : '#F8FAFC',
              color: scheme.enrolled ? 'var(--accent-green)' : 'var(--text-main)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle size={16} />
            <span>
              {scheme.enrolled
                ? (lang === 'hi' ? 'नामांकन स्थिति हटाएं' : 'Mark as Not Enrolled')
                : (lang === 'hi' ? 'नामांकित के रूप में चिह्नित करें' : 'Mark as Already Enrolled')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
