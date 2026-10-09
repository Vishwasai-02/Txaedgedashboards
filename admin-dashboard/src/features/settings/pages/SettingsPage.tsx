import React, { useState } from 'react';
import { Building2, Shield, Bell, Sliders, Save, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import { sharedWorkflowStore } from '../../../core/store/sharedWorkflowStore';
import './SettingsPage.css';

const DEFAULT_ORG_FORM = {
  firmName: 'TaxEdge Financial & Legal Advisory LLP',
  brandName: 'TaxEdge',
  gstin: '27AAACT9988C1ZR',
  cin: 'U74999MH2021PTC355201',
  email: 'admin@taxedge.in',
  phone: '+91 98200 12345',
  address: 'Level 14, Tower B, Peninsula Business Park, Lower Parel, Mumbai, Maharashtra 400013',
  website: 'https://taxedge.in'
};

const DEFAULT_SECURITY_FORM = {
  twoFactorAuth: true,
  sessionTimeout: '30',
  enforceStrongPassword: true,
  ipWhitelisting: false
};

const DEFAULT_SLA_FORM = {
  gstFilingSla: '3',
  itrFilingSla: '2',
  loanSanctionSla: '5',
  escalationThresholdHours: '24',
  autoAssignment: true
};

const DEFAULT_NOTIF_FORM = {
  emailUrgentDocs: true,
  smsOtp: true,
  dailySummaryDigest: true,
  managerEscalationAlerts: true,
  repaymentReminders: true
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('org');
  const [savedMessage, setSavedMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [orgForm, setOrgForm] = useState(DEFAULT_ORG_FORM);
  const [securityForm, setSecurityForm] = useState(DEFAULT_SECURITY_FORM);
  const [slaForm, setSlaForm] = useState(DEFAULT_SLA_FORM);
  const [notifForm, setNotifForm] = useState(DEFAULT_NOTIF_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmResetDataModal, setConfirmResetDataModal] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (activeTab === 'org') {
      if (!orgForm.firmName.trim()) errs.firmName = 'Firm legal name is required.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(orgForm.email.trim())) errs.email = 'Enter a valid official email.';
      if (orgForm.gstin.trim() && orgForm.gstin.trim().length !== 15) {
        errs.gstin = 'GSTIN must be 15 alphanumeric characters.';
      }
    } else if (activeTab === 'security') {
      const timeout = parseInt(securityForm.sessionTimeout, 10);
      if (isNaN(timeout) || timeout < 5 || timeout > 480) {
        errs.sessionTimeout = 'Session timeout must be between 5 and 480 minutes.';
      }
    } else if (activeTab === 'sla') {
      if (Number(slaForm.gstFilingSla) <= 0) errs.gstFilingSla = 'GST SLA must be at least 1 day.';
      if (Number(slaForm.itrFilingSla) <= 0) errs.itrFilingSla = 'ITR SLA must be at least 1 day.';
      if (Number(slaForm.loanSanctionSla) <= 0) errs.loanSanctionSla = 'Loan Sanction SLA must be at least 1 day.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setErrorMessage('Please correct form errors before saving.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    setSavedMessage(true);
    setErrorMessage('');
    setTimeout(() => {
      setSavedMessage(false);
    }, 3500);
  };

  const handleRevert = () => {
    if (activeTab === 'org') setOrgForm(DEFAULT_ORG_FORM);
    if (activeTab === 'security') setSecurityForm(DEFAULT_SECURITY_FORM);
    if (activeTab === 'sla') setSlaForm(DEFAULT_SLA_FORM);
    if (activeTab === 'notif') setNotifForm(DEFAULT_NOTIF_FORM);
    setErrors({});
  };

  return (
    <div className="tx-settings-page">
      <PageHeader
        title="Platform Settings & Configuration"
        subtitle="Manage firm credentials, SLA thresholds, security standards, and notification parameters"
        breadcrumb={['Admin', 'System', 'Settings']}
        actions={
          <>
            {savedMessage && (
              <div className="tx-save-toast">
                <CheckCircle2 size={16} />
                <span>Configuration changes saved successfully!</span>
              </div>
            )}
            {errorMessage && (
              <div className="tx-save-toast" style={{ backgroundColor: '#FEF2F2', color: '#DC2626', borderColor: '#FCA5A5' }}>
                <AlertTriangle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}
          </>
        }
      />

      <div className="tx-settings-layout">
        <div className="tx-settings-sidebar">
          <button
            type="button"
            className={`tx-settings-nav-btn ${activeTab === 'org' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('org');
              setErrors({});
            }}
          >
            <Building2 size={18} />
            <span>Organization Profile</span>
          </button>
          <button
            type="button"
            className={`tx-settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('security');
              setErrors({});
            }}
          >
            <Shield size={18} />
            <span>Security & Access</span>
          </button>
          <button
            type="button"
            className={`tx-settings-nav-btn ${activeTab === 'sla' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('sla');
              setErrors({});
            }}
          >
            <Sliders size={18} />
            <span>SLA & Workflows</span>
          </button>
          <button
            type="button"
            className={`tx-settings-nav-btn ${activeTab === 'notif' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('notif');
              setErrors({});
            }}
          >
            <Bell size={18} />
            <span>Notification Rules</span>
          </button>
        </div>

        <div className="tx-settings-panel">
          {activeTab === 'org' && (
            <form onSubmit={handleSave} className="tx-settings-form">
              <div className="tx-panel-header">
                <h3>Organization Profile & Legal Credentials</h3>
                <p>TaxEdge registered LLP details shown on invoices, DSC filings, and sanction orders.</p>
              </div>

              <div className="tx-form-row">
                <div className="tx-setting-group">
                  <label>Registered Legal Entity Name *</label>
                  <input
                    type="text"
                    className={`tx-setting-input ${errors.firmName ? 'is-invalid' : ''}`}
                    value={orgForm.firmName}
                    onChange={(e) => setOrgForm({ ...orgForm, firmName: e.target.value })}
                  />
                  {errors.firmName && <span className="tx-error-text">{errors.firmName}</span>}
                </div>
                <div className="tx-setting-group">
                  <label>Brand Trade Name</label>
                  <input
                    type="text"
                    className="tx-setting-input"
                    value={orgForm.brandName}
                    onChange={(e) => setOrgForm({ ...orgForm, brandName: e.target.value })}
                  />
                </div>
              </div>

              <div className="tx-form-row">
                <div className="tx-setting-group">
                  <label>GSTIN Identifier</label>
                  <input
                    type="text"
                    maxLength={15}
                    className={`tx-setting-input ${errors.gstin ? 'is-invalid' : ''}`}
                    value={orgForm.gstin}
                    onChange={(e) => setOrgForm({ ...orgForm, gstin: e.target.value.toUpperCase() })}
                  />
                  {errors.gstin && <span className="tx-error-text">{errors.gstin}</span>}
                </div>
                <div className="tx-setting-group">
                  <label>Corporate Identity Number (CIN/LLPIN)</label>
                  <input
                    type="text"
                    className="tx-setting-input"
                    value={orgForm.cin}
                    onChange={(e) => setOrgForm({ ...orgForm, cin: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="tx-form-row">
                <div className="tx-setting-group">
                  <label>Administrative Email *</label>
                  <input
                    type="email"
                    className={`tx-setting-input ${errors.email ? 'is-invalid' : ''}`}
                    value={orgForm.email}
                    onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                  />
                  {errors.email && <span className="tx-error-text">{errors.email}</span>}
                </div>
                <div className="tx-setting-group">
                  <label>Primary Phone</label>
                  <input
                    type="tel"
                    className="tx-setting-input"
                    value={orgForm.phone}
                    onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="tx-setting-group">
                <label>Principal Place of Business</label>
                <textarea
                  rows={2}
                  className="tx-setting-input"
                  value={orgForm.address}
                  onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                />
              </div>

              <div className="tx-panel-footer">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="tx-revert-btn" onClick={handleRevert}>
                    <RotateCcw size={15} />
                    <span>Revert to Default</span>
                  </button>
                  <button
                    type="button"
                    className="tx-revert-btn"
                    style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                    onClick={() => setConfirmResetDataModal(true)}
                  >
                    <RotateCcw size={15} />
                    <span>Reset Mock Data</span>
                  </button>
                </div>
                <button type="submit" className="tx-save-btn">
                  <Save size={16} />
                  <span>Save Organization Profile</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSave} className="tx-settings-form">
              <div className="tx-panel-header">
                <h3>Security Standards & Session Controls</h3>
                <p>Configure MFA enforcement, session expiration timers, and credential security.</p>
              </div>

              <div className="tx-setting-toggle-item">
                <div className="tx-toggle-info">
                  <span className="tx-toggle-title">Enforce Two-Factor Authentication (MFA)</span>
                  <span className="tx-toggle-desc">Require TOTP or SMS OTP for all Super Admin and Department Manager logins.</span>
                </div>
                <input
                  type="checkbox"
                  className="tx-toggle-switch"
                  checked={securityForm.twoFactorAuth}
                  onChange={(e) => setSecurityForm({ ...securityForm, twoFactorAuth: e.target.checked })}
                />
              </div>

              <div className="tx-setting-group" style={{ maxWidth: '300px' }}>
                <label>Inactive Session Inactivity Timeout (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  className={`tx-setting-input ${errors.sessionTimeout ? 'is-invalid' : ''}`}
                  value={securityForm.sessionTimeout}
                  onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeout: e.target.value })}
                />
                {errors.sessionTimeout && <span className="tx-error-text">{errors.sessionTimeout}</span>}
              </div>

              <div className="tx-setting-toggle-item">
                <div className="tx-toggle-info">
                  <span className="tx-toggle-title">Enforce Strong Password Rotation</span>
                  <span className="tx-toggle-desc">Mandate 90-day password cycling with minimum 12 alphanumeric characters.</span>
                </div>
                <input
                  type="checkbox"
                  className="tx-toggle-switch"
                  checked={securityForm.enforceStrongPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, enforceStrongPassword: e.target.checked })}
                />
              </div>

              <div className="tx-panel-footer">
                <button type="button" className="tx-revert-btn" onClick={handleRevert}>
                  <RotateCcw size={15} />
                  <span>Reset Security Controls</span>
                </button>
                <button type="submit" className="tx-save-btn">
                  <Save size={16} />
                  <span>Save Security Standards</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'sla' && (
            <form onSubmit={handleSave} className="tx-settings-form">
              <div className="tx-panel-header">
                <h3>SLA Thresholds & Auto-Dispatch Parameters</h3>
                <p>Define statutory turnaround expectations and automated risk escalation triggers.</p>
              </div>

              <div className="tx-form-row">
                <div className="tx-setting-group">
                  <label>GST Filing SLA Target (Days)</label>
                  <input
                    type="number"
                    min="1"
                    className={`tx-setting-input ${errors.gstFilingSla ? 'is-invalid' : ''}`}
                    value={slaForm.gstFilingSla}
                    onChange={(e) => setSlaForm({ ...slaForm, gstFilingSla: e.target.value })}
                  />
                  {errors.gstFilingSla && <span className="tx-error-text">{errors.gstFilingSla}</span>}
                </div>
                <div className="tx-setting-group">
                  <label>ITR Filing SLA Target (Days)</label>
                  <input
                    type="number"
                    min="1"
                    className={`tx-setting-input ${errors.itrFilingSla ? 'is-invalid' : ''}`}
                    value={slaForm.itrFilingSla}
                    onChange={(e) => setSlaForm({ ...slaForm, itrFilingSla: e.target.value })}
                  />
                  {errors.itrFilingSla && <span className="tx-error-text">{errors.itrFilingSla}</span>}
                </div>
              </div>

              <div className="tx-form-row">
                <div className="tx-setting-group">
                  <label>Loan Sanction Turnaround Target (Days)</label>
                  <input
                    type="number"
                    min="1"
                    className={`tx-setting-input ${errors.loanSanctionSla ? 'is-invalid' : ''}`}
                    value={slaForm.loanSanctionSla}
                    onChange={(e) => setSlaForm({ ...slaForm, loanSanctionSla: e.target.value })}
                  />
                  {errors.loanSanctionSla && <span className="tx-error-text">{errors.loanSanctionSla}</span>}
                </div>
                <div className="tx-setting-group">
                  <label>Manager Escalation Warning (Hours Before Breach)</label>
                  <input
                    type="number"
                    min="1"
                    className="tx-setting-input"
                    value={slaForm.escalationThresholdHours}
                    onChange={(e) => setSlaForm({ ...slaForm, escalationThresholdHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="tx-panel-footer">
                <button type="button" className="tx-revert-btn" onClick={handleRevert}>
                  <RotateCcw size={15} />
                  <span>Restore SLA Defaults</span>
                </button>
                <button type="submit" className="tx-save-btn">
                  <Save size={16} />
                  <span>Save SLA Thresholds</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notif' && (
            <form onSubmit={handleSave} className="tx-settings-form">
              <div className="tx-panel-header">
                <h3>System Notifications & Dispatch Channels</h3>
                <p>Configure which alerts are routed via WhatsApp, email, or executive dashboards.</p>
              </div>

              <div className="tx-setting-toggle-item">
                <div className="tx-toggle-info">
                  <span className="tx-toggle-title">Urgent Document Rejection Alerts</span>
                  <span className="tx-toggle-desc">Dispatch immediate WhatsApp &amp; SMS pings to clients when documents fail verification.</span>
                </div>
                <input
                  type="checkbox"
                  className="tx-toggle-switch"
                  checked={notifForm.emailUrgentDocs}
                  onChange={(e) => setNotifForm({ ...notifForm, emailUrgentDocs: e.target.checked })}
                />
              </div>

              <div className="tx-setting-toggle-item">
                <div className="tx-toggle-info">
                  <span className="tx-toggle-title">Filing OTP Verification Reminders</span>
                  <span className="tx-toggle-desc">Automated SMS ping when GST/ITR EVC OTP is requested by filing executive.</span>
                </div>
                <input
                  type="checkbox"
                  className="tx-toggle-switch"
                  checked={notifForm.smsOtp}
                  onChange={(e) => setNotifForm({ ...notifForm, smsOtp: e.target.checked })}
                />
              </div>

              <div className="tx-setting-toggle-item">
                <div className="tx-toggle-info">
                  <span className="tx-toggle-title">Daily Operations Executive Digest</span>
                  <span className="tx-toggle-desc">Deliver a daily 8:00 AM summary of pending filings and overdue tasks to managers.</span>
                </div>
                <input
                  type="checkbox"
                  className="tx-toggle-switch"
                  checked={notifForm.dailySummaryDigest}
                  onChange={(e) => setNotifForm({ ...notifForm, dailySummaryDigest: e.target.checked })}
                />
              </div>

              <div className="tx-panel-footer">
                <button type="button" className="tx-revert-btn" onClick={handleRevert}>
                  <RotateCcw size={15} />
                  <span>Restore Notification Defaults</span>
                </button>
                <button type="submit" className="tx-save-btn">
                  <Save size={16} />
                  <span>Save Notification Rules</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmResetDataModal}
        onClose={() => setConfirmResetDataModal(false)}
        onConfirm={() => {
          sharedWorkflowStore.resetStore();
          setConfirmResetDataModal(false);
          setSavedMessage(true);
          setErrorMessage('');
          setTimeout(() => setSavedMessage(false), 3500);
        }}
        title="Reset Platform Mock Data"
        message="Are you sure you want to reset all mock platform data (customers, employees, services, applications, tasks, sanctions, repayments, revenue) to factory defaults? This action cannot be undone."
        confirmText="Reset All Data"
        variant="danger"
      />
    </div>
  );
}
