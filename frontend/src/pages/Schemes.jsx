import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EnrollmentModal } from '../components/EnrollmentModal';
import { ShieldCheck, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';

export const Schemes = () => {
  const { t, lang } = useLang();
  const { user, updateUserProfile } = useAuth();

  const [age, setAge] = useState(user?.age || 26);
  const [incomeBand, setIncomeBand] = useState(user?.monthly_income_band || '15k_25k');
  const [state, setState] = useState(user?.state || 'Delhi');
  const [gigCategory, setGigCategory] = useState(user?.gig_category || 'Delivery Partner');

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchemeModal, setSelectedSchemeModal] = useState(null);

  useEffect(() => {
    runEligibilityCheck();
  }, []);

  const runEligibilityCheck = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.checkSchemes({
        age: parseInt(age),
        monthly_income_band: incomeBand,
        state,
        gig_category: gigCategory
      });
      if (res.schemes) {
        setSchemes(res.schemes);
      }
    } catch (err) {
      console.error('Failed checking scheme eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnroll = async (schemeCode, enrolledState) => {
    try {
      await api.toggleEnrollScheme(schemeCode, enrolledState);
      setSchemes(prev => prev.map(s => s.code === schemeCode ? { ...s, enrolled: enrolledState } : s));
    } catch (err) {
      console.error('Failed toggling enrollment:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>{t('schemes.title')}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {t('schemes.subtitle')}
        </p>
      </div>

      {/* QUESTIONNAIRE FORM CARD */}
      <form onSubmit={runEligibilityCheck} className="card-pastel card-pastel-purple">
        <h3 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={18} color="var(--accent-purple)" />
          <span>{t('schemes.questionnaireTitle')}</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label className="form-label">{t('schemes.ageLabel')}</label>
            <input
              type="number"
              className="form-input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="16"
              max="75"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label className="form-label">{t('schemes.incomeBandLabel')}</label>
            <select
              className="form-select"
              value={incomeBand}
              onChange={(e) => setIncomeBand(e.target.value)}
            >
              <option value="below_15k">&lt; ₹15,000 / mo</option>
              <option value="15k_25k">₹15,000 - ₹25,000</option>
              <option value="25k_35k">₹25,000 - ₹35,000</option>
              <option value="above_35k">&gt; ₹35,000 / mo</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">{t('schemes.stateLabel')}</label>
            <select className="form-select" value={state} onChange={(e) => setState(e.target.value)}>
              <option value="Delhi">Delhi NCR</option>
              <option value="Maharashtra">Maharashtra (Mumbai/Pune)</option>
              <option value="Karnataka">Karnataka (Bengaluru)</option>
              <option value="Telangana">Telangana (Hyderabad)</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Other">Other State</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">{t('schemes.categoryLabel')}</label>
            <select className="form-select" value={gigCategory} onChange={(e) => setGigCategory(e.target.value)}>
              <option value="Delivery Partner">Delivery Partner</option>
              <option value="Ride-hail Driver">Ride-hail Driver</option>
              <option value="Home Services">Home Services</option>
              <option value="Other Gig Work">Other Gig Work</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ background: 'var(--accent-purple)' }}>
          <span>{loading ? 'Evaluating...' : t('schemes.checkBtn')}</span>
        </button>
      </form>

      {/* SCHEME RESULTS CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {schemes.map((sc, index) => {
          // Color rotation per card
          const cardClasses = [
            'card-pastel-green',
            'card-pastel-blue',
            'card-pastel-teal',
            'card-pastel-orange'
          ];
          const iconCircles = [
            'icon-circle-green',
            'icon-circle-blue',
            'icon-circle-teal',
            'icon-circle-orange'
          ];
          const accentColors = ['#16A085', '#2E86DE', '#028090', '#F39C12'];

          const currentClass = cardClasses[index % cardClasses.length];
          const currentIcon = iconCircles[index % iconCircles.length];
          const currentAccent = accentColors[index % accentColors.length];

          return (
            <div key={sc.code} className={`card-pastel ${currentClass}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div className={`icon-circle ${currentIcon}`}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      {lang === 'hi' ? sc.title_hi : sc.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: currentAccent, fontWeight: '700', textTransform: 'uppercase' }}>
                      {sc.category}
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '14px' }}>
                {lang === 'hi' ? sc.benefit_hi : sc.benefit}
              </p>

              {/* Status Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {sc.eligible ? (
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', background: '#D4EDDA', color: '#155724', fontSize: '0.78rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} />
                    {t('schemes.eligibleBadge')}
                  </span>
                ) : (
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', background: '#F8D7DA', color: '#721C24', fontSize: '0.78rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={13} />
                    {t('schemes.ineligibleBadge')} ({sc.reason})
                  </span>
                )}

                {sc.enrolled && (
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', background: 'var(--bg-dark-navy)', color: 'white', fontSize: '0.78rem', fontWeight: '700' }}>
                    {t('schemes.enrolledBadge')}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                <button
                  onClick={() => setSelectedSchemeModal(sc)}
                  className="btn-primary"
                  style={{ background: currentAccent, fontSize: '0.85rem', padding: '10px' }}
                >
                  <span>{t('schemes.enrollBtn')}</span>
                  <Info size={15} />
                </button>

                <button
                  onClick={() => handleToggleEnroll(sc.code, !sc.enrolled)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-light)',
                    background: sc.enrolled ? 'white' : 'rgba(0,0,0,0.05)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                  title="Toggle enrollment status"
                >
                  {sc.enrolled ? '✓ Enrolled' : '+ Mark Enrolled'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrollment Instructions Modal */}
      {selectedSchemeModal && (
        <EnrollmentModal
          scheme={selectedSchemeModal}
          onClose={() => setSelectedSchemeModal(null)}
          onToggleEnroll={handleToggleEnroll}
        />
      )}

    </div>
  );
};
