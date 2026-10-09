import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Banknote,
  Users,
  CheckCircle2,
  Clock,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building2,
  RefreshCw,
  X
} from 'lucide-react';
import SummaryCard from '../../../core/components/SummaryCard/SummaryCard';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import { loanManagerApi } from '../services/loanManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import './LoanManagerDashboardPage.css';

export default function LoanManagerDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await loanManagerApi.getDashboardStats();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const unsub = loanManagerApi.subscribe(() => fetchData());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const res = await loanManagerApi.getDashboardStats();
    setData(res);
    setRefreshing(false);
    showToast('Lending command center metrics refreshed.', 'info');
  };

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading || !data) {
    return <div className="tx-loading-state">Loading Loan Operations Command Center...</div>;
  }

  const { kpis, funnel, recentApplications } = data;

  const getCibilBadgeClass = (score: number) => {
    if (score >= 750) return 'tx-cibil-excellent';
    if (score >= 700) return 'tx-cibil-good';
    return 'tx-cibil-fair';
  };

  return (
    <div className="tx-loan-dashboard-page">
      {feedback && (
        <div className={`tx-loan-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <PageHeader
        title="Credit & Lending Operations Command Center"
        subtitle="Manage end-to-end retail and MSME lending: leads, eligibility appraisal, CIBIL audit, underwriting, and disbursements"
        breadcrumb={['Loan Domain', 'Lending Desk', 'Overview']}
        badge={<span className="tx-loan-domain-pill">NBFC & BANKING SYNDICATE</span>}
        actions={
          <div className="tx-loan-header-actions">
            <button
              type="button"
              className="tx-btn-loan-refresh"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Analytics"
            >
              <RefreshCw size={15} className={refreshing ? 'tx-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <NavLink to="/loan-manager/leads" className="tx-btn-loan-secondary">
              <Users size={16} />
              <span>Lead Ingestion</span>
            </NavLink>
            <NavLink to="/loan-manager/applications" className="tx-btn-loan-primary">
              <Banknote size={16} />
              <span>Pipeline Desk</span>
            </NavLink>
          </div>
        }
      />

      <div className="tx-loan-summary-grid">
        <SummaryCard
          title="Active Lending Pipeline"
          value={kpis.activePipeline}
          subtext="Total Requested Capital"
          icon={<Banknote size={20} />}
          iconTheme="blue"
          trend="+18%"
          trendDirection="up"
          onClick={() => navigate('/loan-manager/applications')}
        />
        <SummaryCard
          title="Disbursed Volume (MTD)"
          value={kpis.disbursedThisMonth}
          subtext="16 Cases Released via Escrow"
          icon={<CheckCircle2 size={20} />}
          iconTheme="green"
          trend="+22%"
          trendDirection="up"
          onClick={() => navigate('/loan-manager/sanctions')}
        />
        <SummaryCard
          title="Underwriting Queue"
          value={kpis.underwritingQueue}
          subtext="Pending Credit Sign-Off"
          icon={<ShieldCheck size={20} />}
          iconTheme="orange"
          onClick={() => navigate('/loan-manager/underwriting')}
        />
        <SummaryCard
          title="First-Time Clearance Ratio"
          value={kpis.approvalRatio}
          subtext="High Quality Origination"
          icon={<TrendingUp size={20} />}
          iconTheme="green"
          onClick={() => navigate('/loan-manager/reports')}
        />
      </div>

      <div className="tx-loan-grid-two">
        <div className="tx-loan-card">
          <div className="tx-loan-card-head">
            <div>
              <h3 className="tx-loan-card-title">Recent Origination Applications</h3>
              <p className="tx-loan-card-sub">Active borrower files awaiting review or progression</p>
            </div>
            <NavLink to="/loan-manager/applications" className="tx-loan-view-all">
              <span>View All ({recentApplications.length})</span>
              <ArrowRight size={14} />
            </NavLink>
          </div>

          <div className="tx-loan-app-table-wrap">
            <table className="tx-loan-table">
              <thead>
                <tr>
                  <th>App Ref</th>
                  <th>Borrower</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Bureau CIBIL</th>
                  <th>Current Stage</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app: any) => (
                  <tr key={app.id}>
                    <td><strong>{app.id}</strong></td>
                    <td>{app.borrower}</td>
                    <td>{app.loanType}</td>
                    <td><strong>{app.amount}</strong></td>
                    <td>
                      <span className={`tx-cibil-pill ${getCibilBadgeClass(app.cibil)}`}>
                        {app.cibil}
                      </span>
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tx-loan-card">
          <div className="tx-loan-card-head">
            <div>
              <h3 className="tx-loan-card-title">Lending Pipeline Funnel</h3>
              <p className="tx-loan-card-sub">Origination stages from lead drop to capital release</p>
            </div>
          </div>

          <div className="tx-funnel-list">
            {funnel.map((step: any, idx: number) => (
              <div key={step.stage} className="tx-funnel-step">
                <div className="tx-funnel-header">
                  <div className="tx-funnel-title-wrap">
                    <span className="tx-funnel-num">{idx + 1}</span>
                    <span className="tx-funnel-name">{step.stage}</span>
                  </div>
                  <div className="tx-funnel-counts">
                    <span className="tx-f-cases">{step.count} Files</span>
                    <span className="tx-f-val">{step.volume}</span>
                  </div>
                </div>
                <div className="tx-funnel-bar-bg">
                  <div
                    className="tx-funnel-bar-fill"
                    style={{ width: `${Math.min(100, (step.count / 25) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
