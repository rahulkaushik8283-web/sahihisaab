import React from 'react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { Globe, Wallet } from 'lucide-react';

export const Navbar = () => {
  const { lang, toggleLang, t } = useLang();
  const { user } = useAuth();

  return (
    <header className="app-header">
      <div className="brand-logo">
        <div className="brand-icon-circle">
          ₹
        </div>
        <div>
          <h1 className="brand-title">{t('appName')}</h1>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '-2px' }}>
            {user ? `${user.name} (${user.city || 'Delhi'})` : t('tagline')}
          </span>
        </div>
      </div>

      <button className="lang-toggle-btn" onClick={toggleLang} title="Switch English / Hindi">
        <Globe size={15} />
        <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
      </button>
    </header>
  );
};
