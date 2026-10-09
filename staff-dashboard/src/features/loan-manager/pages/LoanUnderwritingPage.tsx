import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, FileText, Send, Building, Calculator } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import { loanManagerApi } from '../services/loanManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import './LoanUnderwritingPage.css';

const DEFAULT_CASES = [
  {
    id: 'UW-CASE-01',
    appId: 'LN-APP-801',
    borrower: 'Apex Infra Projects LLP',
    loanType: 'Working Capital Term Loan',
    requestedAmount: 5000000,
    cibil: 785,
    syndicatePartner: 'HDFC Bank & SIDBI',
    defaultAmount: 4500000,
    defaultRoi: 10.5,
    defaultTenure: 36,
    checklist: [
      { id: 'c1', label: 'Statutory Financial Audit & Form 3CB/3CD Cleared', passed: true },
      { id: 'c2', label: 'Primary Banker Operational NOC Confirmed', passed: true },
      { id: 'c3', label: 'Promoter Background & MCA DIN Cross-check Clear', passed: true },
      { id: 'c4', label: 'Commercial Contract Work Order Backing Verified', passed: true },
    ]
  },
  {
    id: 'UW-CASE-02',
    appId: 'LN-APP-803',
    borrower: 'Nexus Retail Solutions',
    loanType: 'Machinery Expansion Loan',
    requestedAmount: 2500000,
    cibil: 720,
    syndicatePartner: 'Axis Bank Commercial',
    defaultAmount: 2000000,
    defaultRoi: 11.2,
    defaultTenure: 48,
    checklist: [
      { id: 'c1', label: 'Statutory Financial Audit & Form 3CB/3CD Cleared', passed: true },
      { id: 'c2', label: 'Primary Banker Operational NOC Confirmed', passed: false },
      { id: 'c3', label: 'Promoter Background & MCA DIN Cross-check Clear', passed: true },
      { id: 'c4', label: 'Machinery Valuation & Quotation Validated', passed: false },
    ]
  }
];

export default function LoanUnderwritingPage() {
  const [cases, setCases] = useState<any[]>(DEFAULT_CASES);
  const [activeCaseId, setActiveCaseId] = useState(DEFAULT_CASES[0].id);

  const activeCase = cases.find((c: any) => c.id === activeCaseId) || cases[0];

  const [decision, setDecision] = useState('APPROVE');
  const [approvedAmount, setApprovedAmount] = useState<number>(activeCase?.defaultAmount || 0);
  const [interestRate, setInterestRate] = useState<number>(activeCase?.defaultRoi || 10.5);
  const [tenure, setTenure] = useState<number>(activeCase?.defaultTenure || 36);
  const [rationale, setRationale] = useState('Borrower exhibits strong EBITDA margins and solid 3-year turnover growth. Recommended sanction with CGTMSE guarantee coverage.');
  const [rationaleError, setRationaleError] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const loadCases = async () => {
    const data = await loanManagerApi.getUnderwritingCases();
    if (data && data.length > 0) {
      setCases(data);
      if (!activeCaseId || !data.some((c: any) => c.id === activeCaseId)) {
        setActiveCaseId(data[0].id);
        setApprovedAmount(data[0].defaultAmount || 0);
        setInterestRate(data[0].defaultRoi || 10.5);
        setTenure(data[0].defaultTenure || 36);
      }
    }
  };

  useEffect(() => {
    loadCases();
    const unsub = loanManagerApi.subscribe(() => loadCases());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleSelectCase = (caseItem: any) => {
    setActiveCaseId(caseItem.id);
    setApprovedAmount(caseItem.defaultAmount || 0);
    setInterestRate(caseItem.defaultRoi || 10.5);
    setTenure(caseItem.defaultTenure || 36);
    setRationaleError('');
    if (caseItem.id === 'UW-CASE-02') {
      setDecision('CONDITIONAL');
      setRationale('Recommend conditional clearance subject to receipt of Primary Banker NOC and certified supplier machinery quotation.');
    } else {
      setDecision('APPROVE');
      setRationale('Borrower exhibits strong EBITDA margins and solid 3-year turnover growth. Recommended sanction with CGTMSE guarantee coverage.');
    }
  };

  const handleToggleChecklist = (checkId: string) => {
    const updated = (activeCase.checklist || []).map((c: any) =>
      c.id === checkId ? { ...c, passed: !c.passed } : c
    );
    setCases(cases.map((cs: any) => (cs.id === activeCase.id ? { ...cs, checklist: updated } : cs)));
  };

  // Live EMI calculation
  const r = (interestRate / 12) / 100;
  const n = tenure;
  const calculatedEmi = approvedAmount > 0 && r > 0 && n > 0
    ? Math.round((approvedAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
    : 0;

  const pendingChecklistCount = (activeCase.checklist || []).filter((c: any) => !c.passed).length;

  const handleDecisionPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim() || rationale.trim().length < 15) {
      setRationaleError('Underwriting rationale is mandatory and must contain at least 15 characters.');
      return;
    }
    if (approvedAmount <= 0) {
      setRationaleError('Approved Sanction Capital must be greater than zero.');
      return;
    }
    setRationaleError('');
    setConfirmModalOpen(true);
  };

  const handleConfirmDecision = async () => {
    setConfirmModalOpen(false);
    await loanManagerApi.signOffUnderwriting(activeCase.appId, {
      decision,
      approvedAmount: Number(approvedAmount),
      interestRate: Number(interestRate),
      tenure: Number(tenure),
      rationale: rationale.trim()
    });
    await loadCases();
    setToast(`Credit Committee decision (${decision}) signed off for ${activeCase.borrower}. Sanction documentation dispatched to syndication desk.`);
    setTimeout(() => setToast(''), 5000);
  };

  return (
    <div className="tx-loan-underwriting-page">
      <PageHeader
        title="Credit Risk Underwriting & Sanction Sign-Off"
        subtitle="Finalize credit committee risk appraisal, calibrate sanctioned capital & pricing, and endorse credit memo"
        breadcrumb={['Loan Domain', 'Underwriting', 'Sign-Off']}
      />

      {toast && (
        <div className="tx-uw-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Case Selector Tabs */}
      <div className="tx-uw-case-tabs">
        {cases.map((cs) => (
          <button
            key={cs.id}
            type="button"
            className={`tx-uw-tab ${activeCase.id === cs.id ? 'active' : ''}`}
            onClick={() => handleSelectCase(cs)}
          >
            <span className="tx-uw-tab-id">{cs.id}</span>
            <strong className="tx-uw-tab-name">{cs.borrower}</strong>
            <span className="tx-uw-tab-amt">₹{(cs.requestedAmount / 100000).toFixed(1)}L Requested</span>
          </button>
        ))}
      </div>

      <div className="tx-uw-layout">
        <div className="tx-uw-case-panel">
          <div className="tx-uw-case-header">
            <div>
              <span className="tx-uw-app-id">{activeCase.appId} • {activeCase.id}</span>
              <h3 className="tx-uw-borrower">{activeCase.borrower}</h3>
              <span className="tx-uw-product">{activeCase.loanType} • Bureau CIBIL: {activeCase.cibil}</span>
            </div>
            <div className="tx-uw-partner-badge">
              <Building size={14} />
              <span>{activeCase.syndicatePartner}</span>
            </div>
          </div>

          <div className="tx-uw-checklist-section">
            <div className="tx-checklist-header-row">
              <h4 className="tx-uw-section-title">Risk Policy Prerequisite Checklist</h4>
              <span className="tx-checklist-badge">
                {activeCase.checklist.length - pendingChecklistCount} of {activeCase.checklist.length} Conditions Satisfied
              </span>
            </div>

            {decision === 'APPROVE' && pendingChecklistCount > 0 && (
              <div className="tx-checklist-warning-box">
                <AlertTriangle size={15} />
                <span>
                  Notice: {pendingChecklistCount} policy condition{pendingChecklistCount > 1 ? 's are' : ' is'} currently unsatisfied. Proceeding will issue a Conditional Sanction Memo requiring pre-disbursement compliance.
                </span>
              </div>
            )}

            <div className="tx-uw-checklist-list">
              {activeCase.checklist.map((item: any) => (
                <div
                  key={item.id}
                  className={`tx-uw-check-row ${item.passed ? 'passed' : 'failed'}`}
                  onClick={() => handleToggleChecklist(item.id)}
                >
                  <div className="tx-check-icon">
                    {item.passed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <span className="tx-check-label">{item.label}</span>
                  <span className="tx-check-status">{item.passed ? 'Satisfied (Click to toggle)' : 'Pending Action (Click to satisfy)'}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleDecisionPrompt} className="tx-uw-decision-form">
            <h4 className="tx-uw-section-title">Credit Committee Sanction Determination</h4>

            <div className="tx-decision-selector">
              <button
                type="button"
                className={`tx-decision-btn approve ${decision === 'APPROVE' ? 'active' : ''}`}
                onClick={() => setDecision('APPROVE')}
              >
                <CheckCircle2 size={16} />
                <span>Sanction Approval</span>
              </button>
              <button
                type="button"
                className={`tx-decision-btn conditional ${decision === 'CONDITIONAL' ? 'active' : ''}`}
                onClick={() => setDecision('CONDITIONAL')}
              >
                <AlertTriangle size={16} />
                <span>Conditional Approval</span>
              </button>
              <button
                type="button"
                className={`tx-decision-btn reject ${decision === 'REJECT' ? 'active' : ''}`}
                onClick={() => setDecision('REJECT')}
              >
                <XCircle size={16} />
                <span>Decline File</span>
              </button>
            </div>

            {rationaleError && (
              <div className="tx-uw-error-banner">
                <AlertTriangle size={14} />
                <span>{rationaleError}</span>
              </div>
            )}

            <div className="tx-form-row">
              <div className="tx-form-group">
                <label>Approved Sanction Capital (₹)</label>
                <input
                  type="number"
                  step="50000"
                  min="100000"
                  value={approvedAmount}
                  onChange={(e) => {
                    setApprovedAmount(Number(e.target.value));
                    if (rationaleError) setRationaleError('');
                  }}
                  required
                />
              </div>
              <div className="tx-form-group">
                <label>Recommended Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="tx-form-row">
              <div className="tx-form-group">
                <label>Sanction Tenure (Months)</label>
                <input
                  type="number"
                  min="6"
                  max="360"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  required
                />
              </div>
              <div className="tx-form-group">
                <label>Calculated Monthly Amortization (EMI)</label>
                <div className="tx-computed-emi-box">
                  <Calculator size={15} />
                  <span>₹{(calculatedEmi || 0).toLocaleString('en-IN')} / month</span>
                </div>
              </div>
            </div>

            <div className="tx-form-group">
              <label>Underwriting Rationale &amp; Conditions Precedent (Min 15 chars) *</label>
              <textarea
                rows={3}
                value={rationale}
                onChange={(e) => {
                  setRationale(e.target.value);
                  if (rationaleError) setRationaleError('');
                }}
                required
              />
            </div>

            <div className="tx-uw-form-footer">
              <button type="submit" className="tx-btn-submit-uw">
                <ShieldCheck size={16} />
                <span>Endorse Credit Decision &amp; Generate Sanction Letter</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDecision}
        title={`Confirm Underwriting Sign-Off: ${decision}`}
        message={`Are you sure you want to sign off credit determination "${decision}" with sanctioned capital ₹${approvedAmount.toLocaleString('en-IN')} at ${interestRate}% p.a. for "${activeCase.borrower}"?`}
        confirmText="Confirm Underwriting Sign-Off"
        variant={decision === 'REJECT' ? 'danger' : 'primary'}
      />
    </div>
  );
}
