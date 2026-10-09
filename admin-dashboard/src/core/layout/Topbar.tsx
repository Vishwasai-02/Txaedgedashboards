import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, LogOut, ExternalLink, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Topbar.css';

export interface TopbarProps {
  title?: string;
  onMobileMenuToggle?: () => void;
}

export default function Topbar({ title = 'Dashboard Overview', onMobileMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

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
        <a
          href="http://localhost:3001/"
          target="_blank"
          rel="noopener noreferrer"
          className="tx-topbar-staff-link"
          title="Open Staff Operations Portal (CA / Loan / Agent)"
        >
          <span>Staff Portal</span>
          <ExternalLink size={13} />
        </a>

        <div className="tx-role-badge-pill">
          <span>Role: {user?.role || 'Admin'}</span>
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
          <div className="tx-topbar-avatar">{user?.avatar || 'AD'}</div>
          <div className="tx-topbar-user-details">
            <span className="tx-topbar-user-name">{user?.name || 'Administrator'}</span>
            <span className="tx-topbar-user-email">{user?.email || 'admin@taxedge.in'}</span>
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
