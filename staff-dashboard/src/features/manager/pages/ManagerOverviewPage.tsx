import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ListTodo,
  CalendarCheck,
  AlertTriangle
} from 'lucide-react';
import SummaryCard from '../../../core/components/SummaryCard/SummaryCard';
import IncomingQueueTable from '../components/IncomingQueueTable';
import TeamMonitoringTable from '../components/TeamMonitoringTable';
import { managerApi } from '../services/managerApi';
import { useAuth } from '../../../core/hooks/useAuth';
import './ManagerOverviewPage.css';

export default function ManagerOverviewPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      managerApi.getOverviewMetrics(),
      managerApi.getIncomingQueue(),
      managerApi.getTeamMonitoring()
    ]).then(([m, inc, t]) => {
      setMetrics(m);
      setIncoming(inc);
      setTeam(t);
      setLoading(false);
    });
  }, [user?.id, user?.domain]);

  if (loading || !metrics) {
    return <div>Loading manager dashboard...</div>;
  }

  const isLoan = user?.domain === 'LOAN';

  return (
    <div className="tx-mgr-overview">
      <div className="tx-mgr-hero">
        <h2>{isLoan ? 'Loan Case Manager Operations Hub' : 'CA Case Manager Operations Hub'}</h2>
        <p>
          {isLoan
            ? 'Retail & Commercial lending appraisals, credit audits, and executive distribution'
            : 'Incoming application triage, document audits, SLA compliance, and agent workload distribution'}
        </p>
      </div>

      <div className="tx-mgr-summary-grid">
        <SummaryCard
          title="Total Department Customers"
          value={metrics.totalCustomers}
          icon={<Users size={20} />}
          iconTheme="blue"
        />
        <SummaryCard
          title="New Incoming Cases"
          value={metrics.newApplications}
          subtext="Awaiting verification"
          icon={<AlertCircle size={20} />}
          iconTheme="orange"
        />
        <SummaryCard
          title="Documents Pending Review"
          value={metrics.documentsPending}
          icon={<FileText size={20} />}
          iconTheme="orange"
        />
        <SummaryCard
          title="Payment Pending Cases"
          value={metrics.paymentsPending}
          icon={<CreditCard size={20} />}
          iconTheme="navy"
        />
        <SummaryCard
          title="Tasks In Execution"
          value={metrics.tasksPending}
          icon={<ListTodo size={20} />}
          iconTheme="blue"
        />
        <SummaryCard
          title="Today's Target Tasks"
          value={metrics.todaysTasks}
          icon={<CalendarCheck size={20} />}
          iconTheme="green"
        />
        <SummaryCard
          title="Overdue Tasks (SLA Risk)"
          value={metrics.overdueTasks}
          icon={<AlertTriangle size={20} />}
          iconTheme="orange"
        />
        <SummaryCard
          title="Completed Cases"
          value={metrics.completedApplications}
          icon={<CheckCircle2 size={20} />}
          iconTheme="green"
        />
      </div>

      <div className="tx-mgr-section-header">
        <h3 className="tx-mgr-section-title">Priority Incoming Applications Queue</h3>
      </div>
      <IncomingQueueTable applications={incoming} />

      <div className="tx-mgr-section-header">
        <h3 className="tx-mgr-section-title">Executive Team Capacity &amp; Monitoring</h3>
      </div>
      <TeamMonitoringTable team={team} />
    </div>
  );
}
