import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const toggleLang = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[lang];
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        // Fallback to English if translation key missing
        let fallback = translations['en'];
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return result;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
