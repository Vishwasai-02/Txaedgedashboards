import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../core/layout/DashboardLayout';
import LoginPage from '../features/auth/pages/LoginPage';

// CA Manager Pages
import CaManagerDashboardPage from '../features/ca-manager/pages/CaManagerDashboardPage';
import CaCustomersPage from '../features/ca-manager/pages/CaCustomersPage';
import CaServiceQueuePage from '../features/ca-manager/pages/CaServiceQueuePage';
import CaDocumentReviewPage from '../features/ca-manager/pages/CaDocumentReviewPage';
import CaFilingCalendarPage from '../features/ca-manager/pages/CaFilingCalendarPage';
import CaTeamPage from '../features/ca-manager/pages/CaTeamPage';
import CaFollowupsPage from '../features/ca-manager/pages/CaFollowupsPage';
import CaReportsPage from '../features/ca-manager/pages/CaReportsPage';
import CaProfilePage from '../features/ca-manager/pages/CaProfilePage';

// Loan Manager Pages
import LoanManagerDashboardPage from '../features/loan-manager/pages/LoanManagerDashboardPage';
import LoanLeadsPage from '../features/loan-manager/pages/LoanLeadsPage';
import LoanApplicationsPage from '../features/loan-manager/pages/LoanApplicationsPage';
import LoanEligibilityPage from '../features/loan-manager/pages/LoanEligibilityPage';
import LoanDocumentsPage from '../features/loan-manager/pages/LoanDocumentsPage';
import LoanCreditAssessmentPage from '../features/loan-manager/pages/LoanCreditAssessmentPage';
import LoanUnderwritingPage from '../features/loan-manager/pages/LoanUnderwritingPage';
import LoanSanctionsPage from '../features/loan-manager/pages/LoanSanctionsPage';
import LoanRepaymentsPage from '../features/loan-manager/pages/LoanRepaymentsPage';
import LoanReportsPage from '../features/loan-manager/pages/LoanReportsPage';
import LoanProfilePage from '../features/loan-manager/pages/LoanProfilePage';
import LoanTeamPage from '../features/loan-manager/pages/LoanTeamPage';
import LoanCustomersPage from '../features/loan-manager/pages/LoanCustomersPage';
import LoanServiceQueuePage from '../features/loan-manager/pages/LoanServiceQueuePage';
import LoanFollowupsPage from '../features/loan-manager/pages/LoanFollowupsPage';

// Agent Pages
import AgentDashboardPage from '../features/agent/pages/AgentDashboardPage';
import AgentTaskQueuePage from '../features/agent/pages/AgentTaskQueuePage';
import TaskDetailPage from '../features/agent/pages/TaskDetailPage';
import AgentDocumentsPage from '../features/agent/pages/AgentDocumentsPage';
import AgentProfilePage from '../features/agent/pages/AgentProfilePage';

// Shared Communication & Notifications
import StaffChatPage from '../features/communication/pages/StaffChatPage';
import StaffNotificationsPage from '../features/notifications/pages/StaffNotificationsPage';

// Legacy Manager Pages
import ManagerOverviewPage from '../features/manager/pages/ManagerOverviewPage';
import ApplicationVerificationPage from '../features/manager/pages/ApplicationVerificationPage';

import { useAuth } from '../core/hooks/useAuth';
import { ROLES } from '../core/constants/roles';
import './AppRoutes.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  title?: string;
}

function ProtectedRoute({ children, title }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout title={title}>{children}</DashboardLayout>;
}

export default function AppRoutes() {
  const { user } = useAuth();

  const isCaManager = user?.role === ROLES.CA_MANAGER || (user?.role === ROLES.MANAGER && user?.domain === 'CA');
  const isLoanManager = user?.role === ROLES.LOAN_MANAGER || (user?.role === ROLES.MANAGER && user?.domain === 'LOAN');

  const defaultRedirect = isCaManager
    ? '/ca-manager/dashboard'
    : isLoanManager
    ? '/loan-manager/dashboard'
    : '/agent/dashboard';

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* CA Manager Routes */}
      <Route
        path="/ca-manager/dashboard"
        element={
          <ProtectedRoute title="CA Operations Command Center">
            <CaManagerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ca-manager/customers"
        element={
          <ProtectedRoute title="Client Compliance Portfolio">
            <CaCustomersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ca-manager/service-queue"
        element={
          <ProtectedRoute title="Filing & Service Caseload">
            <CaServiceQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ca-manager/document-review"
        element={
          <ProtectedRoute title="Document Audit & Verification">
            <CaDocumentReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ca-manager/filing-calendar"
        element={
          <ProtectedRoute title="Statutory Filing Calendar">
            <CaFilingCalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ca-manager/team"
        element={
          <ProtectedRoute title="Team Allocation & Capacity">
            <CaTeamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ca-manager/followups"
        element={
          <ProtectedRoute title="Client Follow-ups & Interventions">
            <CaFollowupsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ca-manager/reports"
        element={
          <ProtectedRoute title="CA Compliance Reports">
            <CaReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ca-manager/profile"
        element={
          <ProtectedRoute title="CA Professional Profile">
            <CaProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Loan Manager Routes */}
      <Route
        path="/loan-manager/dashboard"
        element={
          <ProtectedRoute title="Credit Operations Command Center">
            <LoanManagerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/customers"
        element={
          <ProtectedRoute title="Borrower Accounts Portfolio">
            <LoanCustomersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/leads"
        element={
          <ProtectedRoute title="Borrower Leads Ingestion">
            <LoanLeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/applications"
        element={
          <ProtectedRoute title="Lending Applications Pipeline">
            <LoanApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/eligibility"
        element={
          <ProtectedRoute title="FOIR & Eligibility Engine">
            <LoanEligibilityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/documents"
        element={
          <ProtectedRoute title="Credit Documents Due Diligence">
            <LoanDocumentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/credit-assessment"
        element={
          <ProtectedRoute title="Credit Bureau & CIBIL Audit">
            <LoanCreditAssessmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/underwriting"
        element={
          <ProtectedRoute title="Underwriting & Risk Sign-Off">
            <LoanUnderwritingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/sanctions"
        element={
          <ProtectedRoute title="Sanctions & Disbursement Release">
            <LoanSanctionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/repayments"
        element={
          <ProtectedRoute title="Amortization & Recovery Ledger">
            <LoanRepaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/reports"
        element={
          <ProtectedRoute title="Lending Portfolio Audits">
            <LoanReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/service-queue"
        element={
          <ProtectedRoute title="Lending Service Queue">
            <LoanServiceQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/followups"
        element={
          <ProtectedRoute title="Borrower Outreach & Follow-ups">
            <LoanFollowupsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/team"
        element={
          <ProtectedRoute title="Agents">
            <LoanTeamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-manager/profile"
        element={
          <ProtectedRoute title="Credit Head Credentials">
            <LoanProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Agent Routes */}
      <Route
        path="/agent/dashboard"
        element={
          <ProtectedRoute title="Agent Operations Desk">
            <AgentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/tasks"
        element={
          <ProtectedRoute title="Executive Task Queue">
            <AgentTaskQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/tasks/:id"
        element={
          <ProtectedRoute title="Case Execution & Filing">
            <TaskDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/documents"
        element={
          <ProtectedRoute title="Document Ingestion & Upload">
            <AgentDocumentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/profile"
        element={
          <ProtectedRoute title="Agent Professional Profile">
            <AgentProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Legacy Manager routes preserved */}
      <Route
        path="/manager/overview"
        element={
          <ProtectedRoute title="Manager Overview">
            <ManagerOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/incoming-queue"
        element={
          <ProtectedRoute title="Incoming Applications Queue">
            <ManagerOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/verify/:id"
        element={
          <ProtectedRoute title="Application Case Audit & Pricing">
            <ApplicationVerificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/team"
        element={
          <ProtectedRoute title="Team Monitoring & Allocation">
            <ManagerOverviewPage />
          </ProtectedRoute>
        }
      />

      {/* Shared Staff Communication & Notifications */}
      <Route
        path="/communication"
        element={
          <ProtectedRoute title="Staff Communication">
            <StaffChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute title="Operational Notifications">
            <StaffNotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Dynamic role-based fallback */}
      <Route path="/" element={<Navigate to={defaultRedirect} replace />} />
      <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
    </Routes>
  );
}
