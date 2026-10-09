import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, LogOut, ArrowLeftRight, ExternalLink, ShieldCheck, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import './Topbar.css';

export interface TopbarProps {
  title?: string;
  onMobileMenuToggle?: () => void;
}

export default function Topbar({ title = 'Staff Workspace', onMobileMenuToggle }: TopbarProps) {
  const { user, logout, switchPersona } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  const handleSelectPersona = (personaKey: string) => {
    switchPersona(personaKey);
    setRoleMenuOpen(false);
    if (personaKey === 'CA_MANAGER') {
      navigate('/ca-manager/dashboard');
    } else if (personaKey === 'LOAN_MANAGER') {
      navigate('/loan-manager/dashboard');
    } else {
      navigate('/agent/dashboard');
    }
  };

  const getActiveRoleLabel = () => {
    if (user?.role === ROLES.CA_MANAGER || (user?.role === ROLES.MANAGER && user?.domain === 'CA')) {
      return 'CA Manager (Sanjay Verma)';
    }
    if (user?.role === ROLES.LOAN_MANAGER || (user?.role === ROLES.MANAGER && user?.domain === 'LOAN')) {
      return 'Loan Manager (Ananya Deshmukh)';
    }
    return 'Executive Agent (Suresh Kumar)';
  };

  return (
    <header className="tx-topbar">
      <div className="tx-topbar-left">
        <button
          type="button"
          className="tx-topbar-mobile-menu-btn"
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation menu"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="tx-page-title-heading">{title}</h1>
      </div>

      <div className="tx-topbar-right">
        {/* Jump to Super Admin portal link */}
        <a
          href="http://localhost:5173/"
          target="_blank"
          rel="noopener noreferrer"
          className="tx-topbar-admin-link"
          title="Open Super Admin Command Center"
        >
          <span>Admin Portal</span>
          <ExternalLink size={13} />
        </a>

        {/* 1-Click Role Switcher Dropdown */}
        <div className="tx-role-switcher-dropdown">
          <button
            type="button"
            className="tx-topbar-role-pill"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            title="Switch Dashboard Role"
          >
            <ShieldCheck size={15} className="tx-role-icon" />
            <span className="tx-role-pill-text">{getActiveRoleLabel()}</span>
            <ChevronDown size={14} />
          </button>

          {roleMenuOpen && (
            <div className="tx-role-menu">
              <div className="tx-role-menu-header">SWITCH ROLE VIEW</div>
              <button
                type="button"
                className="tx-role-menu-item"
                onClick={() => handleSelectPersona('CA_MANAGER')}
              >
                <div className="tx-role-item-dot dot-ca" />
                <div className="tx-role-item-text">
                  <strong>CA Manager</strong>
                  <span>Sanjay Verma (ICAI Lead)</span>
                </div>
              </button>
              <button
                type="button"
                className="tx-role-menu-item"
                onClick={() => handleSelectPersona('LOAN_MANAGER')}
              >
                <div className="tx-role-item-dot dot-loan" />
                <div className="tx-role-item-text">
                  <strong>Loan Manager</strong>
                  <span>Ananya Deshmukh (Credit Head)</span>
                </div>
              </button>
              <button
                type="button"
                className="tx-role-menu-item"
                onClick={() => handleSelectPersona('CA_AGENT')}
              >
                <div className="tx-role-item-dot dot-agent" />
                <div className="tx-role-item-text">
                  <strong>Executive Agent</strong>
                  <span>Suresh Kumar (Filing Desk)</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="tx-topbar-action-btn"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <a
          href="/notifications"
          className="tx-topbar-action-btn"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="tx-topbar-badge-dot" />
        </a>

        <div className="tx-topbar-profile-container" title="User Account">
          <div className="tx-topbar-avatar">{user?.avatar || 'ST'}</div>
          <div className="tx-topbar-user-details">
            <span className="tx-topbar-user-name">{user?.name}</span>
            <span className="tx-topbar-user-email">{user?.email}</span>
          </div>
        </div>

        <button
          type="button"
          className="tx-topbar-action-btn"
          onClick={logout}
          title="Sign Out"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
