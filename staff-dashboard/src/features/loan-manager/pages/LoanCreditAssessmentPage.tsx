import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Clock,
  FileText,
  RefreshCw,
  Eye,
  Building
} from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import './LoanCreditAssessmentPage.css';

const BORROWER_PROFILES = [
  {
    id: 'LN-APP-801',
    name: 'Apex Infra Projects LLP',
    cibil: 785,
    experian: 792,
    riskCategory: 'PRIME_LOW_RISK',
    activeLines: 2,
    totalExposure: '₹85,00,000',
    creditUtilization: '24%',
    dpdHistory: '0 DPD (Clean 36 Months)',
    enquiriesLast6Months: 1,
    summary: 'Strong commercial track record, timely vendor & equipment term repayments, healthy liquidity.',
    lastPulled: '02 Oct 2026, 09:30 AM',
    tradeLines: [
      { lender: 'State Bank of India', facility: 'Cash Credit / Overdraft', limit: '₹60,00,000', outstanding: '₹14,50,000', dpd: '0 DPD (Regular)', status: 'Active' },
      { lender: 'Tata Capital Commercial', facility: 'Heavy Equipment Loan', limit: '₹25,00,000', outstanding: '₹5,80,000', dpd: '0 DPD (Regular)', status: 'Active' }
    ]
  },
  {
    id: 'LN-APP-802',
    name: 'Sanjay Deshmukh',
    cibil: 760,
    experian: 768,
    riskCategory: 'PRIME_LOW_RISK',
    activeLines: 1,
    totalExposure: '₹4,50,000',
    creditUtilization: '18%',
    dpdHistory: '0 DPD (Clean 24 Months)',
    enquiriesLast6Months: 2,
    summary: 'Salaried IT professional with clean personal credit card and auto loan settlement records.',
    lastPulled: '01 Oct 2026, 04:15 PM',
    tradeLines: [
      { lender: 'HDFC Bank', facility: 'Auto Vehicle Loan', limit: '₹8,50,000', outstanding: '₹4,50,000', dpd: '0 DPD (Regular)', status: 'Active' }
    ]
  },
  {
    id: 'LN-APP-803',
    name: 'Nexus Retail Solutions',
    cibil: 720,
    experian: 715,
    riskCategory: 'MODERATE_RISK',
    activeLines: 3,
    totalExposure: '₹32,00,000',
    creditUtilization: '54%',
    dpdHistory: '1x 30 DPD (Jan 2025)',
    enquiriesLast6Months: 4,
    summary: 'Retail trader with higher revolving overdraft utilization; requires additional collateral or guarantor.',
    lastPulled: '30 Sep 2026, 11:45 AM',
    tradeLines: [
      { lender: 'Axis Bank', facility: 'Secured Business Overdraft', limit: '₹20,00,000', outstanding: '₹18,20,000', dpd: '0 DPD', status: 'Active' },
      { lender: 'Bajaj Finserv', facility: 'Unsecured Business Term Loan', limit: '₹12,00,000', outstanding: '₹7,40,000', dpd: '1x 30 DPD (Jan 2025)', status: 'Active' }
    ]
  }
];

export default function LoanCreditAssessmentPage() {
  const [profiles, setProfiles] = useState(BORROWER_PROFILES);
  const [selectedId, setSelectedId] = useState(BORROWER_PROFILES[0].id);
  const [isPulling, setIsPulling] = useState(false);
  const [linesModalOpen, setLinesModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const selectedProfile = profiles.find((p) => p.id === selectedId) || profiles[0];

  const handlePullBureauReport = () => {
    setIsPulling(true);
    setTimeout(() => {
      setIsPulling(false);
      const newScore = Math.min(850, selectedProfile.cibil + Math.floor(Math.random() * 5));
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === selectedProfile.id
            ? { ...p, cibil: newScore, lastPulled: `Today at ${now}` }
            : p
        )
      );
      setToast(`Fresh CIBIL & Experian scorecards retrieved for ${selectedProfile.name}. Bureau score refreshed.`);
      setTimeout(() => setToast(''), 4500);
    }, 1200);
  };

  const handleConfirmApproval = () => {
    setConfirmModalOpen(false);
    setToast(`Credit Risk Assessment PASSED for ${selectedProfile.name}. Transferred to Credit Committee for Underwriting.`);
    setTimeout(() => setToast(''), 5000);
  };

  return (
    <div className="tx-loan-credit-page">
      <PageHeader
        title="Credit Bureau & Risk Assessment Engine"
        subtitle="Analyze multi-bureau TransUnion CIBIL & Experian scorecards, credit utilization, and repayment track records"
        breadcrumb={['Loan Domain', 'Underwriting', 'Credit Assessment']}
      />

      {toast && (
        <div className="tx-credit-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="tx-credit-layout">
        {/* Borrower Selector */}
        <div className="tx-borrower-sidebar">
          <h3 className="tx-sidebar-title">Borrower Assessment Queue</h3>
          <div className="tx-borrower-list">
            {profiles.map((p) => (
              <div
                key={p.id}
                className={`tx-b-card ${selectedProfile.id === p.id ? 'active' : ''}`}
                onClick={() => setSelectedId(p.id)}
              >
                <div className="tx-b-top">
                  <span className="tx-b-id">{p.id}</span>
                  <span className="tx-b-cibil-badge">{p.cibil} CIBIL</span>
                </div>
                <h4 className="tx-b-name">{p.name}</h4>
                <span className="tx-b-risk">{(p.riskCategory || 'STANDARD').replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Credit Scorecard */}
        <div className="tx-scorecard-panel">
          <div className="tx-scorecard-header">
            <div>
              <h3 className="tx-scorecard-borrower">{selectedProfile.name}</h3>
              <span className="tx-scorecard-sub">
                Application: {selectedProfile.id} • Bureau Report Sync: {selectedProfile.lastPulled}
              </span>
            </div>
            <div className="tx-sc-header-actions">
              <button
                type="button"
                className="tx-btn-pull-bureau"
                onClick={handlePullBureauReport}
                disabled={isPulling}
              >
                <RefreshCw size={14} className={isPulling ? 'tx-spin' : ''} />
                <span>{isPulling ? 'Pulling Bureau Data...' : 'Pull Latest Bureau Report'}</span>
              </button>
              <span className="tx-risk-badge prime">LOW RISK APPRAISAL</span>
            </div>
          </div>

          <div className="tx-bureau-gauges">
            <div className="tx-gauge-box">
              <span className="tx-gauge-lbl">TransUnion CIBIL</span>
              <div className="tx-gauge-score-wrap">
                <span className="tx-gauge-val">{selectedProfile.cibil}</span>
                <span className="tx-gauge-max">/ 900</span>
              </div>
              <span className="tx-gauge-status">
                {selectedProfile.cibil >= 750 ? 'Excellent Prime' : 'Moderate Prime'}
              </span>
            </div>

            <div className="tx-gauge-box">
              <span className="tx-gauge-lbl">Experian Commercial</span>
              <div className="tx-gauge-score-wrap">
                <span className="tx-gauge-val">{selectedProfile.experian}</span>
                <span className="tx-gauge-max">/ 900</span>
              </div>
              <span className="tx-gauge-status">Prime Grade</span>
            </div>

            <div className="tx-gauge-box">
              <span className="tx-gauge-lbl">Credit Utilization</span>
              <div className="tx-gauge-score-wrap">
                <span className="tx-gauge-val">{selectedProfile.creditUtilization}</span>
              </div>
              <span className="tx-gauge-status">
                {parseInt(selectedProfile.creditUtilization) < 30 ? 'Optimal (< 30%)' : 'Watchlist (> 50%)'}
              </span>
            </div>
          </div>

          <div className="tx-credit-obligations-card">
            <div className="tx-ob-header-row">
              <h4 className="tx-obligations-title">Bureau Trade Lines &amp; Exposure Summary</h4>
              <button
                type="button"
                className="tx-btn-inspect-lines"
                onClick={() => setLinesModalOpen(true)}
              >
                <Eye size={13} />
                <span>Inspect All Active Trade Lines ({selectedProfile.tradeLines?.length || 0})</span>
              </button>
            </div>
            <div className="tx-obligations-grid">
              <div className="tx-ob-item">
                <span className="tx-ob-lbl">Active Credit Lines</span>
                <span className="tx-ob-val">{selectedProfile.activeLines} Accounts</span>
              </div>
              <div className="tx-ob-item">
                <span className="tx-ob-lbl">Total Outstanding Exposure</span>
                <span className="tx-ob-val">{selectedProfile.totalExposure}</span>
              </div>
              <div className="tx-ob-item">
                <span className="tx-ob-lbl">Repayment Track (DPD)</span>
                <span className="tx-ob-val highlight">{selectedProfile.dpdHistory}</span>
              </div>
              <div className="tx-ob-item">
                <span className="tx-ob-lbl">Recent Bureau Enquiries</span>
                <span className="tx-ob-val">{selectedProfile.enquiriesLast6Months} Enquiries (Last 6 Mos)</span>
              </div>
            </div>
          </div>

          <div className="tx-risk-analyst-notes">
            <h4 className="tx-notes-title">Underwriting Credit Assessment Note</h4>
            <p className="tx-notes-text">{selectedProfile.summary}</p>
          </div>

          <div className="tx-scorecard-actions">
            <button
              type="button"
              className="tx-btn-pass-credit"
              onClick={() => setConfirmModalOpen(true)}
            >
              <ShieldCheck size={16} />
              <span>Pass Credit Assessment &amp; Forward to Underwriting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trade Lines Inspection Modal */}
      {selectedProfile && (
        <Modal
          isOpen={linesModalOpen}
          onClose={() => setLinesModalOpen(false)}
          title={`Active Bureau Trade Lines — ${selectedProfile.name}`}
        >
          <div className="tx-lines-modal-body">
            <div className="tx-lines-modal-header">
              <div>
                <strong>{selectedProfile.name}</strong>
                <span className="tx-muted-block">Application: {selectedProfile.id} • Bureau CIBIL: {selectedProfile.cibil}</span>
              </div>
              <span className="tx-exposure-tag">Total Exposure: {selectedProfile.totalExposure}</span>
            </div>

            <div className="tx-lines-table-wrap">
              <table className="tx-lines-table">
                <thead>
                  <tr>
                    <th>Lender Institution</th>
                    <th>Facility Type</th>
                    <th>Sanction Limit</th>
                    <th>Current Outstanding</th>
                    <th>Repayment (DPD)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProfile.tradeLines?.map((line, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{line.lender}</strong>
                      </td>
                      <td>{line.facility}</td>
                      <td>{line.limit}</td>
                      <td>{line.outstanding}</td>
                      <td>
                        <span className="tx-dpd-pill">{line.dpd}</span>
                      </td>
                      <td>
                        <span className="tx-active-pill">{line.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tx-lines-modal-footer">
              <button
                type="button"
                className="tx-btn-modal-close"
                onClick={() => setLinesModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal for Passing Assessment */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmApproval}
        title="Pass Credit Risk Assessment"
        message={`Confirm endorsement of TransUnion CIBIL (${selectedProfile.cibil}) and clean bureau history for "${selectedProfile.name}". The credit memo will advance to the Underwriting Committee for final sanction determination.`}
        confirmText="Confirm Credit Approval"
        variant="primary"
      />
    </div>
  );
}
