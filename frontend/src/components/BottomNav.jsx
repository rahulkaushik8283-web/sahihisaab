import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { LayoutDashboard, PlusCircle, MinusCircle, FileText, Award, User } from 'lucide-react';

export const BottomNav = () => {
  const { t } = useLang();

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/add-income', label: t('nav.addIncome'), icon: PlusCircle },
    { path: '/add-expense', label: t('nav.addExpense'), icon: MinusCircle },
    { path: '/schemes', label: t('nav.schemes'), icon: FileText },
    { path: '/score', label: t('nav.score'), icon: Award },
    { path: '/profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="nav-icon" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
