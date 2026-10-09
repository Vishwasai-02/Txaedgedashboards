import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileUp,
  ArrowRight,
  TrendingUp,
  PhoneCall,
  Flame,
  RefreshCw
} from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import SummaryCard from '../../../core/components/SummaryCard/SummaryCard';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import PriorityBadge from '../../../core/components/PriorityBadge/PriorityBadge';
import { agentApi } from '../services/agentApi';
import { useAuth } from '../../../core/hooks/useAuth';
import './AgentDashboardPage.css';

export default function AgentDashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState('');

  const loadData = () => {
    return agentApi.getTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData().then(() => {
      setTimeout(() => {
        setIsRefreshing(false);
        setToast('Agent task queue synchronized with manager pipeline.');
        setTimeout(() => setToast(''), 3500);
      }, 500);
    });
  };

  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'PROCESSING').length;
  const reviewCount = tasks.filter((t) => t.status === 'PENDING_REVIEW').length;
  const reworkCount = tasks.filter((t) => t.status === 'REWORK_REQUIRED' || t.status === 'DOCUMENTS_REQUIRED').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="tx-agent-dash-page">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Suresh'}!`}
        subtitle="Manage assigned tax & lending filings, complete verification checklists, and submit returns for manager review"
        breadcrumb={['Executive Operations', 'My Desk', 'Overview']}
        badge={<span className="tx-agent-badge">TAX & COMPLIANCE AGENT</span>}
        actions={
          <div className="tx-agent-actions-top">
            <button
              type="button"
              className="tx-btn-agent-refresh"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={15} className={isRefreshing ? 'tx-spin' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Queue'}</span>
            </button>
            <NavLink to="/agent/tasks" className="tx-btn-agent-dash-primary">
              <CheckSquare size={16} />
              <span>My Task Queue</span>
            </NavLink>
            <NavLink to="/agent/documents" className="tx-btn-agent-dash-secondary">
              <FileUp size={16} />
              <span>Simulate Upload</span>
            </NavLink>
          </div>
        }
      />

      {toast && (
        <div className="tx-agent-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="tx-summary-grid">
        <SummaryCard
          title="Assigned Tasks"
          value={tasks.length}
          subtext="Active cases in my workload"
          icon={<CheckSquare size={20} />}
          iconTheme="blue"
        />
        <SummaryCard
          title="In Progress"
          value={inProgressCount}
          subtext="Currently executing"
          icon={<Clock size={20} />}
          iconTheme="navy"
        />
        <SummaryCard
          title="Manager Review"
          value={reviewCount}
          subtext="Submitted to CA / Loan Mgr"
          icon={<Clock size={20} />}
          iconTheme="orange"
        />
        <SummaryCard
          title="Rework Needed"
          value={reworkCount}
          subtext="Client correction requested"
          icon={<AlertTriangle size={20} />}
          iconTheme="orange"
        />
        <SummaryCard
          title="Completed Today"
          value={completedCount + 2}
          subtext="Successfully dispatched"
          icon={<CheckCircle2 size={20} />}
          iconTheme="green"
          trend="+2"
          trendDirection="up"
        />
        <SummaryCard
          title="Daily SLA Score"
          value="4.9 / 5.0"
          subtext="Resolution speed 2.4 days"
          icon={<Flame size={20} />}
          iconTheme="green"
        />
      </div>

      <div className="tx-agent-split-grid">
        {/* Urgent Task Focus */}
        <div className="tx-agent-card">
          <div className="tx-agent-card-head">
            <div>
              <h3 className="tx-agent-card-title">Priority Focus Queue</h3>
              <p className="tx-agent-card-sub">Files with statutory deadlines due today or tomorrow</p>
            </div>
            <NavLink to="/agent/tasks" className="tx-agent-link">
              <span>View All Tasks</span>
              <ArrowRight size={14} />
            </NavLink>
          </div>

          <div className="tx-agent-task-list">
            {tasks.slice(0, 4).map((task: any) => (
              <div key={task.id} className="tx-agent-task-row">
                <div className="tx-agent-task-info">
                  <div className="tx-task-tag-row">
                    <span className="tx-task-id-tag">{task.id}</span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <h4 className="tx-task-title">{task.title}</h4>
                  <span className="tx-task-meta">
                    Client: <strong>{task.customerName}</strong> • Due: {task.dueDate}
                  </span>
                </div>
                <div className="tx-agent-task-action">
                  <NavLink to={`/agent/tasks/${task.id}`} className="tx-btn-work-task">
                    <span>Work File</span>
                    <ArrowRight size={14} />
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Efficiency & Checklist Standards */}
        <div className="tx-agent-card">
          <div className="tx-agent-card-head">
            <div>
              <h3 className="tx-agent-card-title">Standard Operating Checklist</h3>
              <p className="tx-agent-card-sub">Mandatory steps before submitting files for CA sign-off</p>
            </div>
          </div>

          <div className="tx-checklist-rules">
            <div className="tx-rule-item">
              <CheckCircle2 size={16} className="tx-rule-icon" />
              <div className="tx-rule-text">
                <strong>PAN &amp; Aadhaar Name Match:</strong> Ensure exact phonetic and spelling match across documents.
              </div>
            </div>
            <div className="tx-rule-item">
              <CheckCircle2 size={16} className="tx-rule-icon" />
              <div className="tx-rule-text">
                <strong>Address Proof Vintage:</strong> Electricity/telephone bills must not be older than 60 days.
              </div>
            </div>
            <div className="tx-rule-item">
              <CheckCircle2 size={16} className="tx-rule-icon" />
              <div className="tx-rule-text">
                <strong>Bank Account Proof:</strong> Ensure cancelled cheque exhibits clear MICR and IFSC codes.
              </div>
            </div>
            <div className="tx-rule-item">
              <CheckCircle2 size={16} className="tx-rule-icon" />
              <div className="tx-rule-text">
                <strong>EVC OTP Verification:</strong> Trigger customer call only when ready to submit on tax portal.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
