import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TrendingUp, ArrowDownRight, ArrowUpRight, Plus, Minus, Calendar, Trash2, PieChart, BarChart2 } from 'lucide-react';

export const Dashboard = () => {
  const { t, lang } = useLang();
  const { user } = useAuth();

  const [timeframe, setTimeframe] = useState('this_month');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats(timeframe);
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (tx) => {
    if (window.confirm(`Delete ${tx.title} transaction of ₹${tx.amount}?`)) {
      if (tx.type === 'income') {
        await api.deleteIncome(tx.id);
      } else {
        await api.deleteExpense(tx.id);
      }
      fetchStats();
    }
  };

  const categoryColors = {
    'Fuel': '#F39C12',
    'Vehicle EMI': '#E74C3C',
    'Phone Recharge': '#3498DB',
    'Maintenance': '#9B59B6',
    'Other': '#95A5A6'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Date Range Selector Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {lang === 'hi' ? 'स्वागत है,' : 'Welcome back,'}
          </span>
          <h2 style={{ fontSize: '1.2rem' }}>{user?.name || 'Rahul Kaushik'}</h2>
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem', fontWeight: '700', borderRadius: '9999px', background: 'white' }}
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="this_month">{t('dashboard.timeframeThisMonth')}</option>
          <option value="last_30_days">{t('dashboard.timeframeLast30')}</option>
          <option value="all_time">{t('dashboard.timeframeAllTime')}</option>
        </select>
      </div>

      {/* 1. HERO NET INCOME CARD */}
      <div className="card-navy">
        <div className="hero-net-income">
          <div className="hero-net-label">{t('dashboard.headlineNet')}</div>
          <div className="hero-net-amount">
            ₹{stats ? stats.net_income.toLocaleString('en-IN') : '0'}
          </div>
          <div className="hero-net-badge">
            <TrendingUp size={14} />
            <span>Net Take-Home Cash Flow</span>
          </div>
        </div>

        {/* Quick Gross vs Expense Sub-panel */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px',
          paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.12)'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2ECC71', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', display: 'block' }}>{t('dashboard.grossIncome')}</span>
              <strong style={{ fontSize: '1rem', color: '#2ECC71' }}>₹{stats ? stats.total_gross.toLocaleString('en-IN') : '0'}</strong>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E74C3C', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownRight size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', display: 'block' }}>{t('dashboard.totalExpenses')}</span>
              <strong style={{ fontSize: '1rem', color: '#FF7675' }}>₹{stats ? stats.total_expenses.toLocaleString('en-IN') : '0'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Link to="/add-income" className="btn-primary btn-accent" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          <span>{t('dashboard.addIncomeBtn')}</span>
        </Link>
        <Link to="/add-expense" className="btn-primary" style={{ textDecoration: 'none', background: 'var(--accent-pink)' }}>
          <Minus size={18} />
          <span>{t('dashboard.addExpenseBtn')}</span>
        </Link>
      </div>

      {/* 2. EXPENSE BREAKDOWN BY CATEGORY */}
      <div className="card-pastel card-pastel-orange">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="var(--accent-orange)" />
            <span>{t('dashboard.expenseBreakdown')}</span>
          </h3>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-orange)' }}>
            Total: ₹{stats ? stats.total_expenses.toLocaleString('en-IN') : '0'}
          </span>
        </div>

        {stats && stats.expense_breakdown && stats.expense_breakdown.length > 0 ? (
          <div className="chart-bar-container">
            {stats.expense_breakdown.map((item) => (
              <div key={item.category} className="chart-bar-row">
                <div className="chart-bar-label">
                  <span>{item.category}</span>
                  <span>₹{item.amount.toLocaleString('en-IN')} ({item.percentage}%)</span>
                </div>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: categoryColors[item.category] || 'var(--accent-orange)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No expense records in this timeframe.</p>
        )}
      </div>

      {/* 3. 6-MONTH NET INCOME TREND LINE */}
      <div className="card-pastel card-pastel-blue">
        <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} color="var(--accent-blue)" />
          <span>{t('dashboard.trend6Months')}</span>
        </h3>

        {stats && stats.trend_data ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px', paddingTop: '20px' }}>
            {stats.trend_data.map((m) => {
              const maxVal = Math.max(...stats.trend_data.map(d => d.gross), 1);
              const heightPct = Math.max(10, Math.min(100, (m.net / maxVal) * 100));

              return (
                <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--accent-blue)' }}>
                    ₹{Math.round(m.net / 1000)}k
                  </span>
                  <div style={{ width: '22px', height: '90px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        background: 'var(--accent-blue)',
                        borderRadius: '12px',
                        transition: 'height 0.4s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {m.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* 4. RECENT TRANSACTIONS LOG */}
      <div className="card-pastel card-pastel-purple">
        <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>{t('dashboard.recentTransactions')}</h3>
        
        {stats && stats.recent_transactions && stats.recent_transactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.recent_transactions.map((tx) => (
              <div key={`${tx.type}_${tx.id}`} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={`icon-circle ${tx.type === 'income' ? 'icon-circle-green' : 'icon-circle-pink'}`} style={{ width: '36px', height: '36px' }}>
                    {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1px' }}>{tx.title}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {tx.date} • {tx.detail || tx.type}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '0.95rem', fontWeight: '700',
                    color: tx.type === 'income' ? '#16A085' : '#D81B60'
                  }}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={() => handleDeleteTransaction(tx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#95A5A6', padding: '4px' }}
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('dashboard.noTransactions')}</p>
        )}
      </div>

    </div>
  );
};
