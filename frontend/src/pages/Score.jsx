import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { GaugeChart } from '../components/GaugeChart';
import { Award, CalendarCheck, TrendingUp, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

export const Score = () => {
  const { t, lang } = useLang();
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScore();
  }, []);

  const fetchScore = async () => {
    setLoading(true);
    try {
      const data = await api.getCreditScore();
      setScoreData(data);
    } catch (err) {
      console.error('Failed to load credit score:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFactorIcon = (iconName) => {
    switch (iconName) {
      case 'CalendarCheck': return CalendarCheck;
      case 'TrendingUp': return TrendingUp;
      case 'ShieldCheck': return ShieldCheck;
      default: return Award;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>{t('score.title')}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {t('score.subtitle')}
        </p>
      </div>

      {/* 1. GAUGE VISUAL CARD */}
      <div className="card-navy" style={{ textAlign: 'center', padding: '24px 16px' }}>
        <GaugeChart
          score={scoreData ? scoreData.score : 78}
          maxScore={100}
          color={scoreData ? scoreData.color : '#16A085'}
        />

        <div style={{ marginTop: '16px' }}>
          <span style={{
            padding: '6px 16px', borderRadius: '9999px',
            background: 'rgba(255,255,255,0.12)', color: scoreData ? scoreData.color : '#2ECC71',
            fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {lang === 'hi' ? scoreData?.tier_hi : scoreData?.tier}
          </span>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', marginTop: '10px', lineHeight: '1.4' }}>
            {scoreData?.headline_summary}
          </p>
        </div>
      </div>

      {/* 2. SCORE FACTOR BREAKDOWN CARDS */}
      <div className="card-pastel card-pastel-teal">
        <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color="var(--accent-teal)" />
          <span>{t('score.factorsTitle')}</span>
        </h3>

        {scoreData && scoreData.factors ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scoreData.factors.map((factor) => {
              const IconComp = getFactorIcon(factor.icon);
              const pct = (factor.score / factor.max) * 100;

              return (
                <div key={factor.name} style={{ background: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="icon-circle icon-circle-teal" style={{ width: '28px', height: '28px' }}>
                        <IconComp size={14} />
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700' }}>{factor.name}</span>
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--accent-teal)' }}>
                      {factor.score}/{factor.max} pts
                    </span>
                  </div>

                  <div className="chart-bar-track" style={{ height: '8px', marginBottom: '6px' }}>
                    <div className="chart-bar-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--accent-teal)' }} />
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ℹ️ {factor.status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* 3. SCORE BOOSTER TIPS */}
      <div className="card-pastel card-pastel-orange">
        <h3 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--accent-orange)" fill="var(--accent-orange)" />
          <span>{t('score.tipsTitle')}</span>
        </h3>

        {scoreData && scoreData.tips && scoreData.tips.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scoreData.tips.map((tip, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '2px' }}>{tip.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>{tip.desc}</p>
                </div>
                <span style={{ padding: '4px 8px', borderRadius: '9999px', background: 'var(--accent-orange-bg)', color: '#D35400', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
                  {tip.impact}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            🎉 Outstanding discipline! You have unlocked maximum credit-readiness status.
          </p>
        )}
      </div>

    </div>
  );
};
