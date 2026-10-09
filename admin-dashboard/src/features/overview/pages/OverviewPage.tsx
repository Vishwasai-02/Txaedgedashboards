import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  AlertTriangle,
  Shield,
  UserCheck,
  LifeBuoy,
  FileCheck2,
  ExternalLink,
  Check,
  X,
  RefreshCw,
  Calendar
} from 'lucide-react';
import SummaryCard from '../../../core/components/SummaryCard/SummaryCard';
import RevenueChart from '../components/RevenueChart';
import ApplicationsByServiceChart from '../components/ApplicationsByServiceChart';
import { overviewApi } from '../services/overviewApi';
import './OverviewPage.css';

const PENDING_APPROVALS = [
  { id: 'APV-101', title: 'GST Refund ₹4,25,000 Sign-off', applicant: 'Alpha Logistics LLP', dept: 'CA Domain', requestedBy: 'Sanjay Verma (CA Manager)', time: '20 mins ago', status: 'Pending' },
  { id: 'APV-102', title: 'MSME Loan Sanction ₹45,00,000 Review', applicant: 'Zenith Techworks', dept: 'Loan Domain', requestedBy: 'Ananya Deshmukh (Loan Mgr)', time: '1 hour ago', status: 'Pending' },
  { id: 'APV-103', title: 'New Executive Agent Access Grant', applicant: 'Vikram Patel', dept: 'Staff Operations', requestedBy: 'HR Dept', time: '3 hours ago', status: 'Pending' },
];

export default function OverviewPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvals, setApprovals] = useState<any[]>(PENDING_APPROVALS);
  const [timeframe, setTimeframe] = useState('FY');
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    const res = await overviewApi.getOverviewStats();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const res = await overviewApi.getOverviewStats();
    setData(res);
    setRefreshing(false);
    showFeedback('Dashboard analytics refreshed with latest operational data.', 'success');
  };

  const showFeedback = (message: string, type = 'info') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleApprovalAction = (id: string, action: string) => {
    const item = approvals.find((a: any) => a.id === id);
    setApprovals(approvals.filter((a: any) => a.id !== id));
    if (action === 'approve') {
      showFeedback(`Approved "${item?.title}". Execution authorization dispatched.`, 'success');
    } else {
      showFeedback(`Rejected "${item?.title}". Sent back to ${item?.requestedBy} for revision.`, 'warning');
    }
  };

  if (loading || !data) {
    return <div className="tx-loading-state">Loading dashboard analytics...</div>;
  }

  const { summary, revenueTrends, serviceDistribution, recentActivity } = data;

  // Timeframe adjusted multiplier
  const multiplier = timeframe === 'THIS_MONTH' ? 0.35 : timeframe === 'LAST_QUARTER' ? 0.65 : 1.0;
  const formatCurrency = (val: any) => {
    const numeric = parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
    return `₹${Math.round(numeric * multiplier).toLocaleString('en-IN')}`;
  };
  const scaleCount = (val: any) => {
    const numeric = parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
    return Math.round(numeric * multiplier).toLocaleString('en-IN');
  };

  return (
    <div className="tx-overview-page">
      {feedback && (
        <div className={`tx-overview-feedback-banner ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-feedback" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-overview-hero">
        <div className="tx-hero-text">
          <h2>TaxEdge Central Operations</h2>
          <p>Real-time enterprise intelligence across customer cases, filings, and team performance</p>
        </div>
        <div className="tx-hero-actions">
          <button
            type="button"
            className="tx-hero-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh dashboard metrics"
          >
            <RefreshCw size={15} className={refreshing ? 'tx-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <a
            href="http://localhost:5174/"
            target="_blank"
            rel="noopener noreferrer"
            className="tx-hero-portal-link"
          >
            <span>Open Staff Operations Portal</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Timeframe Controls Bar */}
      <div className="tx-timeframe-toolbar">
        <div className="tx-timeframe-label">
          <Calendar size={15} />
          <span>Analytics Horizon:</span>
        </div>
        <div className="tx-timeframe-pills">
          <button
            type="button"
            className={`tx-timeframe-btn ${timeframe === 'THIS_MONTH' ? 'active' : ''}`}
            onClick={() => setTimeframe('THIS_MONTH')}
          >
            This Month
          </button>
          <button
            type="button"
            className={`tx-timeframe-btn ${timeframe === 'LAST_QUARTER' ? 'active' : ''}`}
            onClick={() => setTimeframe('LAST_QUARTER')}
          >
            Last Quarter (Q2)
          </button>
          <button
            type="button"
            className={`tx-timeframe-btn ${timeframe === 'FY' ? 'active' : ''}`}
            onClick={() => setTimeframe('FY')}
          >
            Financial Year (FY26-27)
          </button>
          <button
            type="button"
            className={`tx-timeframe-btn ${timeframe === 'ALL' ? 'active' : ''}`}
            onClick={() => setTimeframe('ALL')}
          >
            All-Time History
          </button>
        </div>
      </div>

      <div className="tx-summary-grid">
        <SummaryCard
          title="Total Customers"
          value={scaleCount(summary.totalCustomers)}
          subtext="Active client accounts"
          icon={<Users size={20} />}
          iconTheme="blue"
          trend="+12%"
          trendDirection="up"
          onClick={() => navigate('/customers')}
        />
        <SummaryCard
          title="New Customers"
          value={scaleCount(summary.newCustomers)}
          subtext="Registered this month"
          icon={<UserPlus size={20} />}
          iconTheme="green"
          trend="+8%"
          trendDirection="up"
          onClick={() => navigate('/customers')}
        />
        <SummaryCard
          title="Total Applications"
          value={scaleCount(summary.totalApplications)}
          subtext="Filings across all domains"
          icon={<FileText size={20} />}
          iconTheme="navy"
          onClick={() => navigate('/applications')}
        />
        <SummaryCard
          title="Active Applications"
          value={scaleCount(summary.activeApplications)}
          subtext="Currently in progress"
          icon={<Clock size={20} />}
          iconTheme="orange"
          onClick={() => navigate('/applications')}
        />
        <SummaryCard
          title="Completed Applications"
          value={scaleCount(summary.completedApplications)}
          subtext="Successfully delivered"
          icon={<CheckCircle2 size={20} />}
          iconTheme="green"
          trend="+15%"
          trendDirection="up"
          onClick={() => navigate('/applications')}
        />
        <SummaryCard
          title="Pending Applications"
          value={scaleCount(summary.pendingApplications)}
          subtext="Awaiting docs / review"
          icon={<AlertCircle size={20} />}
          iconTheme="orange"
          onClick={() => navigate('/applications')}
        />
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          subtext="Gross collections"
          icon={<CreditCard size={20} />}
          iconTheme="blue"
          trend="+18%"
          trendDirection="up"
          onClick={() => navigate('/revenue')}
        />
        <SummaryCard
          title="Pending Payments"
          value={formatCurrency(summary.pendingPayments)}
          subtext="Invoices awaiting settlement"
          icon={<AlertTriangle size={20} />}
          iconTheme="orange"
          onClick={() => navigate('/revenue')}
        />
        <SummaryCard
          title="Total Managers"
          value={summary.totalManagers}
          subtext="Team leads & supervisors"
          icon={<Shield size={20} />}
          iconTheme="navy"
          onClick={() => navigate('/employees/managers')}
        />
        <SummaryCard
          title="Total Executives / Agents"
          value={summary.totalAgents}
          subtext="Filing & compliance staff"
          icon={<UserCheck size={20} />}
          iconTheme="blue"
          onClick={() => navigate('/employees/agents')}
        />
        <SummaryCard
          title="Open Support Tickets"
          value={scaleCount(summary.openSupportTickets)}
          subtext="L1 / L2 support queries"
          icon={<LifeBuoy size={20} />}
          iconTheme="orange"
        />
        <SummaryCard
          title="AMC Customers"
          value={scaleCount(summary.amcCustomers)}
          subtext="Annual maintenance plans"
          icon={<FileCheck2 size={20} />}
          iconTheme="green"
          onClick={() => navigate('/customers')}
        />
      </div>

      <div className="tx-charts-grid">
        <RevenueChart trends={revenueTrends} />
        <ApplicationsByServiceChart services={serviceDistribution} />
      </div>

      <div className="tx-overview-split">
        <div className="tx-approvals-card">
          <div className="tx-card-head">
            <div>
              <h3 className="tx-activity-title">Executive Approvals Queue</h3>
              <p className="tx-card-sub">High-value sign-offs requiring Super Admin authorization</p>
            </div>
            <span className="tx-counter-badge">{approvals.length} Pending</span>
          </div>

          <div className="tx-approvals-list">
            {approvals.length === 0 ? (
              <div className="tx-empty-approvals">
                <CheckCircle2 size={32} className="tx-empty-icon" />
                <p>All executive approvals cleared.</p>
              </div>
            ) : (
              approvals.map((item) => (
                <div key={item.id} className="tx-approval-item">
                  <div className="tx-approval-info">
                    <span className="tx-approval-badge">{item.dept}</span>
                    <h4 className="tx-approval-name">{item.title}</h4>
                    <span className="tx-approval-meta">
                      Client: <strong>{item.applicant}</strong> • Requisitioned by {item.requestedBy} ({item.time})
                    </span>
                  </div>
                  <div className="tx-approval-actions">
                    <button
                      type="button"
                      className="tx-btn-approve"
                      onClick={() => handleApprovalAction(item.id, 'approve')}
                      title="Approve"
                    >
                      <Check size={15} />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      className="tx-btn-reject"
                      onClick={() => handleApprovalAction(item.id, 'reject')}
                      title="Reject"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="tx-activity-card">
          <div className="tx-card-head">
            <div>
              <h3 className="tx-activity-title">Live Operational Activity</h3>
              <p className="tx-card-sub">Audit trail of critical events across TaxEdge</p>
            </div>
            <span className="tx-status-dot-live" />
          </div>
          <div className="tx-activity-list">
            {(recentActivity || []).map((act: any) => (
              <div key={act.id} className="tx-activity-item">
                <span className="tx-activity-dot" />
                <span className="tx-activity-msg">{act.message}</span>
                <span className="tx-activity-time">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
