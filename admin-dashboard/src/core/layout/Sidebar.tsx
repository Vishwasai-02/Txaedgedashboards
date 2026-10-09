import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  UserCheck,
  CreditCard,
  BarChart3,
  MessageSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Settings
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import taxEdgeLogo from '../../assets/images/taxedge-logo.png';
import './Sidebar.css';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', to: '/overview', icon: <LayoutDashboard size={20} /> },
    { label: 'Applications', to: '/applications', icon: <FileSpreadsheet size={20} />, badge: '14' },
    { label: 'Customers', to: '/customers', icon: <Users size={20} /> },
    { label: 'Managers', to: '/employees/managers', icon: <Shield size={20} /> },
    { label: 'Executives / Agents', to: '/employees/agents', icon: <UserCheck size={20} /> },
    { label: 'Service Catalog', to: '/services', icon: <Layers size={20} /> },
    { label: 'Revenue', to: '/revenue', icon: <CreditCard size={20} /> },
    { label: 'Reports', to: '/reports', icon: <BarChart3 size={20} /> },
    { label: 'Communication', to: '/communication', icon: <MessageSquare size={20} />, badge: '3' },
    { label: 'Notifications', to: '/notifications', icon: <Bell size={20} />, badge: '5' },
    { label: 'Settings', to: '/settings', icon: <Settings size={20} /> }
  ];

  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside className={`tx-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="tx-sidebar-brand">
        <NavLink to="/overview" className="tx-brand-logo" onClick={handleNavClick}>
          <img src={taxEdgeLogo} alt="TaxEdge" className="tx-brand-icon" />
          {!collapsed && (
            <div>
              <span className="tx-brand-text">TaxEdge</span>
              <span className="tx-brand-badge">Super Admin</span>
            </div>
          )}
        </NavLink>
        <button
          type="button"
          className="tx-sidebar-toggle-btn"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="tx-sidebar-nav">
        {!collapsed && <div className="tx-nav-section-title">Main Menu</div>}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) => `tx-nav-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="tx-nav-icon">{item.icon}</span>
            {!collapsed && <span className="tx-nav-label">{item.label}</span>}
            {!collapsed && item.badge && <span className="tx-nav-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="tx-sidebar-footer">
        <div className="tx-sidebar-user">
          <div className="tx-user-avatar">{user?.avatar || 'SA'}</div>
          {!collapsed && (
            <div className="tx-user-info">
              <span className="tx-user-name">{user?.name || 'Super Admin'}</span>
              <span className="tx-user-role">Super Admin</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
