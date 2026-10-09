import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck2,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
import SummaryCard from '../../../core/components/SummaryCard/SummaryCard';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import PriorityBadge from '../../../core/components/PriorityBadge/PriorityBadge';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import { caManagerApi } from '../services/caManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import './CaManagerDashboardPage.css';

export default function CaManagerDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await caManagerApi.getDashboardStats();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const unsubCust = caManagerApi.subscribe(STORAGE_KEYS.CUSTOMERS, () => fetchData());
    const unsubTasks = caManagerApi.subscribe(STORAGE_KEYS.TASKS, () => fetchData());
    return () => {
      if (unsubCust) unsubCust();
      if (unsubTasks) unsubTasks();
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const res = await caManagerApi.getDashboardStats();
    setData(res);
    setRefreshing(false);
    showToast('CA Command Center metrics refreshed.', 'info');
  };

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading || !data) {
    return <div className="tx-loading-state">Loading CA Manager Workspace...</div>;
  }

  const { kpis, distribution, recentRequests, upcomingDeadlines } = data;

  return (
    <div className="tx-ca-dashboard-page">
      {feedback && (
        <div className={`tx-ca-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <PageHeader
        title="CA Operations Command Center"
        subtitle="Supervise GST & ITR compliance, document verifications, statutory deadlines, and team workload"
        breadcrumb={['CA Domain', 'Executive Desk', 'Overview']}
        badge={<span className="tx-ca-domain-pill">ICAI COMPLIANT</span>}
        actions={
          <div className="tx-ca-header-quick-links">
            <button
              type="button"
              className="tx-btn-ca-refresh"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Analytics"
            >
              <RefreshCw size={15} className={refreshing ? 'tx-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <NavLink to="/ca-manager/service-queue" className="tx-btn-ca-primary">
              <Clock size={16} />
              <span>Service Queue</span>
            </NavLink>
            <NavLink to="/ca-manager/document-review" className="tx-btn-ca-secondary">
              <FileCheck2 size={16} />
              <span>Review Documents</span>
            </NavLink>
          </div>
        }
      />

      <div className="tx-ca-summary-grid">
        <SummaryCard
          title="Active Filings in Caseload"
          value={kpis.activeFilings}
          subtext="GST, ITR & MCA Returns"
          icon={<FileText size={20} />}
          iconTheme="blue"
          trend="+5%"
          trendDirection="up"
          onClick={() => navigate('/ca-manager/service-queue')}
        />
        <SummaryCard
          title="Documents Pending Audit"
          value={kpis.pendingDocumentReviews}
          subtext="Requires CA Sign-off"
          icon={<AlertCircle size={20} />}
          iconTheme="orange"
          onClick={() => navigate('/ca-manager/document-review')}
        />
        <SummaryCard
          title="Upcoming Due Dates (7D)"
          value={kpis.deadlinesThisWeek}
          subtext="GSTR-3B & Advance Tax"
          icon={<Calendar size={20} />}
          iconTheme="navy"
          onClick={() => navigate('/ca-manager/filing-calendar')}
        />
        <SummaryCard
          title="Filings Completed (MTD)"
          value={kpis.completedThisMonth}
          subtext="Successfully Filed & Ack"
          icon={<CheckCircle2 size={20} />}
          iconTheme="green"
          trend="+14%"
          trendDirection="up"
          onClick={() => navigate('/ca-manager/reports')}
        />
      </div>

      <div className="tx-ca-grid-two">
        <div className="tx-ca-card">
          <div className="tx-ca-card-head">
            <div>
              <h3 className="tx-ca-card-title">Recent Service Requests</h3>
              <p className="tx-ca-card-sub">Latest customer filings dispatched into your queue</p>
            </div>
            <NavLink to="/ca-manager/service-queue" className="tx-ca-view-all">
              <span>View Caseload</span>
              <ArrowRight size={14} />
            </NavLink>
          </div>

          <div className="tx-ca-req-table-wrap">
            <table className="tx-ca-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Agent</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentRequests || []).map((req: any) => (
                  <tr key={req.id}>
                    <td><strong>{req.id}</strong></td>
                    <td>{req.client}</td>
                    <td>{req.service}</td>
                    <td>{req.assignedAgent || req.agent || 'Suresh Kumar'}</td>
                    <td><PriorityBadge priority={req.priority} /></td>
                    <td><StatusBadge status={req.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tx-ca-card">
          <div className="tx-ca-card-head">
            <div>
              <h3 className="tx-ca-card-title">Statutory Due Dates Watch</h3>
              <p className="tx-ca-card-sub">Critical compliance milestones in the next 15 days</p>
            </div>
            <NavLink to="/ca-manager/filing-calendar" className="tx-ca-view-all">
              <span>Full Calendar</span>
              <ArrowRight size={14} />
            </NavLink>
          </div>

          <div className="tx-deadlines-list">
            {(upcomingDeadlines || []).map((dl: any, idx: number) => {
              const dateParts = (dl.dueDate || '20 Oct 2026').split(' ');
              const day = dateParts[0] || '20';
              const month = dateParts[1] || 'Oct';
              const urgency = (dl.urgency || dl.status || 'NORMAL').toString();
              const desc = dl.description || `${dl.category || 'Compliance'} • ${dl.period || 'Current'}`;

              return (
                <div key={dl.id || `${dl.form}-${idx}`} className="tx-deadline-item">
                  <div className="tx-deadline-date-box">
                    <span className="tx-dl-day">{day}</span>
                    <span className="tx-dl-month">{month}</span>
                  </div>
                  <div className="tx-deadline-info">
                    <h4 className="tx-dl-form">{dl.form}</h4>
                    <span className="tx-dl-desc">{desc}</span>
                    <span className="tx-dl-affected">{dl.clientsAffected || 0} Active Accounts Impacted</span>
                  </div>
                  <span className={`tx-dl-urgency ${urgency.toLowerCase()}`}>
                    {urgency}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
