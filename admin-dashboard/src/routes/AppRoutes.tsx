import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../core/layout/DashboardLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import OverviewPage from '../features/overview/pages/OverviewPage';
import ApplicationsPage from '../features/applications/pages/ApplicationsPage';
import CustomersPage from '../features/customers/pages/CustomersPage';
import ManagersPage from '../features/employees/pages/ManagersPage';
import AgentsPage from '../features/employees/pages/AgentsPage';
import ServicesPage from '../features/services/pages/ServicesPage';
import RevenuePage from '../features/revenue/pages/RevenuePage';
import ReportsPage from '../features/reports/pages/ReportsPage';
import CommunicationPage from '../features/communication/pages/CommunicationPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import { useAuth } from '../core/hooks/useAuth';
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
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/overview"
        element={
          <ProtectedRoute title="Dashboard Overview">
            <OverviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute title="Applications">
            <ApplicationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute title="Customer Directory">
            <CustomersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/managers"
        element={
          <ProtectedRoute title="Managers Management">
            <ManagersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/agents"
        element={
          <ProtectedRoute title="Executives & Agents">
            <AgentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/services"
        element={
          <ProtectedRoute title="Service Catalog & Pricing">
            <ServicesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/revenue"
        element={
          <ProtectedRoute title="Revenue & Collections">
            <RevenuePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute title="Compliance & Operations Reports">
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/communication"
        element={
          <ProtectedRoute title="Executive Communications">
            <CommunicationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute title="System Notifications">
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute title="Platform Settings">
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/overview" replace />} />
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
