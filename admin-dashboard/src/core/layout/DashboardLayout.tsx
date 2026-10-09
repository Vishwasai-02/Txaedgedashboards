import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="tx-dashboard-container">
      {mobileOpen && (
        <div
          className="tx-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="tx-dashboard-main">
        <Topbar
          title={title}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
        />
        <main className="tx-dashboard-content">{children}</main>
      </div>
    </div>
  );
}
