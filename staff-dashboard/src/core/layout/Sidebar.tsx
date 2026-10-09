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
  FileCheck2,
  Calendar,
  PhoneCall,
  Award,
  Banknote,
  Calculator,
  FileText,
  CheckSquare,
  FileUp,
  Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import taxEdgeLogo from '../../assets/images/taxedge-logo.png';
import './Sidebar.css';

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user } = useAuth();

  const isCaManager = user?.role === ROLES.CA_MANAGER || (user?.role === ROLES.MANAGER && user?.domain === 'CA');
  const isLoanManager = user?.role === ROLES.LOAN_MANAGER || (user?.role === ROLES.MANAGER && user?.domain === 'LOAN');
  const isAgent = !isCaManager && !isLoanManager;

  let navItems = [];
  let homeRoute = '/agent/dashboard';
  let badgeLabel = 'Staff';

  if (isCaManager) {
    homeRoute = '/ca-manager/dashboard';
    badgeLabel = 'CA Manager';
    navItems = [
      { label: 'Overview Desk', to: '/ca-manager/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: 'Client Accounts', to: '/ca-manager/customers', icon: <Users size={20} /> },
      { label: 'Service Queue', to: '/ca-manager/service-queue', icon: <FileSpreadsheet size={20} />, badge: '6' },
      { label: 'Document Review', to: '/ca-manager/document-review', icon: <FileCheck2 size={20} />, badge: '2' },
      { label: 'Filing Calendar', to: '/ca-manager/filing-calendar', icon: <Calendar size={20} /> },
      { label: 'Agents', to: '/ca-manager/team', icon: <Shield size={20} /> },
      { label: 'Client Follow-ups', to: '/ca-manager/followups', icon: <PhoneCall size={20} />, badge: '3' },
      { label: 'Compliance Reports', to: '/ca-manager/reports', icon: <BarChart3 size={20} /> },
      { label: 'Team Communication', to: '/communication', icon: <MessageSquare size={20} />, badge: '2' },
      { label: 'My Credentials', to: '/ca-manager/profile', icon: <Award size={20} /> },
    ];
  } else if (isLoanManager) {
    homeRoute = '/loan-manager/dashboard';
    badgeLabel = 'Loan Manager';
    navItems = [
      { label: 'Lending Command', to: '/loan-manager/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: 'Borrower Accounts', to: '/loan-manager/customers', icon: <Users size={20} /> },
      { label: 'Service Queue', to: '/loan-manager/service-queue', icon: <FileSpreadsheet size={20} />, badge: '4' },
      { label: 'Lead Ingestion', to: '/loan-manager/leads', icon: <Users size={20} />, badge: '4' },
      { label: 'Loan Applications', to: '/loan-manager/applications', icon: <Banknote size={20} />, badge: '5' },
      { label: 'FOIR & Eligibility', to: '/loan-manager/eligibility', icon: <Calculator size={20} /> },
      { label: 'Document Audit', to: '/loan-manager/documents', icon: <FileCheck2 size={20} /> },
      { label: 'Credit Assessment', to: '/loan-manager/credit-assessment', icon: <Shield size={20} /> },
      { label: 'Underwriting Sign-off', to: '/loan-manager/underwriting', icon: <FileText size={20} /> },
      { label: 'Sanctions & Payout', to: '/loan-manager/sanctions', icon: <CreditCard size={20} /> },
      { label: 'Repayment Ledger', to: '/loan-manager/repayments', icon: <FileSpreadsheet size={20} /> },
      { label: 'Follow Ups', to: '/loan-manager/followups', icon: <PhoneCall size={20} />, badge: '4' },
      { label: 'Portfolio Reports', to: '/loan-manager/reports', icon: <BarChart3 size={20} /> },
      { label: 'Agents', to: '/loan-manager/team', icon: <Users size={20} /> },
      { label: 'Team Communication', to: '/communication', icon: <MessageSquare size={20} />, badge: '2' },
      { label: 'Lending Profile', to: '/loan-manager/profile', icon: <Award size={20} /> },
    ];
  } else {
    homeRoute = '/agent/dashboard';
    badgeLabel = 'Agent';
    navItems = [
      { label: 'Executive Desk', to: '/agent/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: 'My Task Queue', to: '/agent/tasks', icon: <CheckSquare size={20} />, badge: '5' },
      { label: 'Upload Documents', to: '/agent/documents', icon: <FileUp size={20} /> },
      { label: 'Communication', to: '/communication', icon: <MessageSquare size={20} />, badge: '1' },
      { label: 'Notifications', to: '/notifications', icon: <Bell size={20} />, badge: '3' },
      { label: 'My Profile & CSAT', to: '/agent/profile', icon: <Star size={20} /> },
    ];
  }

  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside className={`tx-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="tx-sidebar-brand">
        <NavLink to={homeRoute} className="tx-brand-logo" onClick={handleNavClick}>
          <img src={taxEdgeLogo} alt="TaxEdge" className="tx-brand-icon" />
          {!collapsed && (
            <div>
              <span className="tx-brand-text">TaxEdge</span>
              <span className="tx-brand-badge">{badgeLabel}</span>
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
        {!collapsed && (
          <div className="tx-nav-section-title">
            {isCaManager ? 'CA Domain Operations' : isLoanManager ? 'Credit Syndicate Desk' : 'Executive Tasking'}
          </div>
        )}
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
          <div className="tx-user-avatar">{user?.avatar || 'ST'}</div>
          {!collapsed && (
            <div className="tx-user-info">
              <span className="tx-user-name">{user?.name || 'Staff Member'}</span>
              <span className="tx-user-role">{badgeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
