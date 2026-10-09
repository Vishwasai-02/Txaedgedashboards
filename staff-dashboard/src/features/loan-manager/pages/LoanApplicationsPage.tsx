import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Banknote, ShieldCheck, CheckCircle2, ArrowRight, Clock, X } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import { loanManagerApi } from '../services/loanManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import './LoanApplicationsPage.css';

export default function LoanApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [toast, setToast] = useState('');

  // Confirmation modal state
  const [confirmStageModal, setConfirmStageModal] = useState({
    isOpen: false,
    newStage: '',
    newStatus: '',
    title: '',
    message: ''
  });

  const loadApplications = () => {
    loanManagerApi.getApplications().then((data: any[]) => {
      setApplications(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadApplications();
    const unsub = loanManagerApi.subscribe(() => loadApplications());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const openAppDetail = (app: any) => {
    setSelectedApp(app);
    setDetailModalOpen(true);
  };

  const promptAdvanceStage = (newStage: string, newStatus: string, actionName: string) => {
    if (!selectedApp) return;
    setConfirmStageModal({
      isOpen: true,
      newStage,
      newStatus,
      title: `Advance Pipeline Stage: ${actionName}`,
      message: `Are you sure you want to transition application ${selectedApp.id} (${selectedApp.borrower}) to stage "${newStage.replace(/_/g, ' ')}"?`
    });
  };

  const handleConfirmAdvance = async () => {
    if (!selectedApp) return;
    const { newStage, newStatus } = confirmStageModal;
    const updated = await loanManagerApi.updateApplicationStage(selectedApp.id, newStage, newStatus);
    loadApplications();
    setSelectedApp(updated || { ...selectedApp, stage: newStage, status: newStatus });
    setConfirmStageModal({ isOpen: false, newStage: '', newStatus: '', title: '', message: '' });
    setToast(`Application ${selectedApp.id} moved to ${newStage.replace(/_/g, ' ')}.`);
    setTimeout(() => setToast(''), 4000);
  };

  const filteredApps = applications.filter((app: any) => {
    const matchStage = stageFilter === 'ALL' || app.stage === stageFilter;
    const q = search.toLowerCase();
    const matchSearch =
      (app.borrower?.toLowerCase() || '').includes(q) ||
      (app.id?.toLowerCase() || '').includes(q) ||
      (app.loanType?.toLowerCase() || '').includes(q);
    return matchStage && matchSearch;
  });

  return (
    <div className="tx-loan-apps-page">
      <PageHeader
        title="Lending Pipeline & Active Credit Applications"
        subtitle="Track multi-stage credit origination from KYC eligibility check to formal loan sanction and disbursement"
        breadcrumb={['Loan Domain', 'Pipeline', 'Applications']}
      />

      {toast && (
        <div className="tx-app-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="tx-apps-controls">
        <div className="tx-apps-search">
          <Search size={16} className="tx-search-icon" />
          <input
            type="text"
            placeholder="Search by Application ID, Borrower, or Loan Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="tx-search-clear-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="tx-apps-stage-pills">
          <button
            type="button"
            className={`tx-stage-pill ${stageFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStageFilter('ALL')}
          >
            All Pipeline ({applications.length})
          </button>
          <button
            type="button"
            className={`tx-stage-pill ${stageFilter === 'UNDERWRITING' ? 'active' : ''}`}
            onClick={() => setStageFilter('UNDERWRITING')}
          >
            Underwriting
          </button>
          <button
            type="button"
            className={`tx-stage-pill ${stageFilter === 'DOCUMENTS_VERIFICATION' ? 'active' : ''}`}
            onClick={() => setStageFilter('DOCUMENTS_VERIFICATION')}
          >
            Doc Verification
          </button>
          <button
            type="button"
            className={`tx-stage-pill ${stageFilter === 'SANCTIONED' ? 'active' : ''}`}
            onClick={() => setStageFilter('SANCTIONED')}
          >
            Sanctioned
          </button>
          <button
            type="button"
            className={`tx-stage-pill ${stageFilter === 'DISBURSED' ? 'active' : ''}`}
            onClick={() => setStageFilter('DISBURSED')}
          >
            Disbursed
          </button>
        </div>
      </div>

      <div className="tx-apps-table-card">
        <div className="tx-table-container">
          <table className="tx-apps-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Borrower Entity</th>
                <th>Loan Product</th>
                <th>Requested</th>
                <th>Approved</th>
                <th>Tenure</th>
                <th>Syndicate Lender</th>
                <th>Stage</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <span className="tx-loan-id-badge">{app.id}</span>
                  </td>
                  <td>
                    <div className="tx-borrower-col">
                      <strong>{app.borrower}</strong>
                      <span className="tx-borrower-sub">{app.applicantType}</span>
                    </div>
                  </td>
                  <td>{app.loanType}</td>
                  <td>
                    <span className="tx-req-amt">
                      {app.requestedAmount != null ? `₹${Number(app.requestedAmount).toLocaleString('en-IN')}` : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="tx-appr-amt">
                      {app.approvedAmount != null ? `₹${Number(app.approvedAmount).toLocaleString('en-IN')}` : 'Under Review'}
                    </span>
                  </td>
                  <td>{app.tenureMonths} Mos</td>
                  <td>
                    <span className="tx-lender-name">{app.bankPartner}</span>
                  </td>
                  <td>
                    <span className="tx-stage-badge">{(app.stage || app.status || 'NEW').replace(/_/g, ' ')}</span>
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="tx-btn-view-app"
                      onClick={() => openAppDetail(app)}
                      title="Inspect application file"
                    >
                      <Eye size={14} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Inspection Modal */}
      {selectedApp && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Credit Dossier — ${selectedApp.id}`}
        >
          <div className="tx-loan-modal-content">
            <div className="tx-loan-modal-banner">
              <div>
                <h4 className="tx-modal-borrower">{selectedApp.borrower}</h4>
                <p className="tx-modal-type">{selectedApp.loanType} • {selectedApp.applicantType}</p>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            <div className="tx-loan-metrics-grid">
              <div className="tx-metric-box">
                <span className="tx-box-lbl">Sanction Approved</span>
                <span className="tx-box-val highlight">
                  {selectedApp.approvedAmount != null ? `₹${Number(selectedApp.approvedAmount).toLocaleString('en-IN')}` : 'Pending Sanction'}
                </span>
              </div>
              <div className="tx-metric-box">
                <span className="tx-box-lbl">Interest Rate (ROI)</span>
                <span className="tx-box-val">{selectedApp.roi}</span>
              </div>
              <div className="tx-metric-box">
                <span className="tx-box-lbl">Bureau CIBIL Score</span>
                <span className="tx-box-val">{selectedApp.cibilScore}</span>
              </div>
              <div className="tx-metric-box">
                <span className="tx-box-lbl">FOIR Ratio</span>
                <span className="tx-box-val">{selectedApp.foir}</span>
              </div>
            </div>

            <div className="tx-loan-syndicate-box">
              <span className="tx-box-lbl">Assigned Syndicate Lender</span>
              <strong className="tx-lender-title">{selectedApp.bankPartner}</strong>
              <span className="tx-tenure-sub">Tenure: {selectedApp.tenureMonths} Months • Turnover: {selectedApp.turnover}</span>
            </div>

            <div className="tx-advance-stage-section">
              <span className="tx-advance-lbl">Advance Pipeline Stage:</span>
              <div className="tx-stage-actions">
                <button
                  type="button"
                  className="tx-btn-stage-action"
                  onClick={() => promptAdvanceStage('SANCTIONED', 'SANCTIONED', 'Issue Sanction Letter')}
                >
                  <ShieldCheck size={14} />
                  <span>Issue Sanction Letter</span>
                </button>
                <button
                  type="button"
                  className="tx-btn-stage-action green"
                  onClick={() => promptAdvanceStage('DISBURSED', 'DISBURSED', 'Disburse Funds')}
                >
                  <CheckCircle2 size={14} />
                  <span>Disburse Funds</span>
                </button>
              </div>
            </div>

            <div className="tx-modal-actions">
              <button
                type="button"
                className="tx-btn-modal-close"
                onClick={() => setDetailModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal for Stage Advancements */}
      <ConfirmationModal
        isOpen={confirmStageModal.isOpen}
        onClose={() => setConfirmStageModal({ isOpen: false, newStage: '', newStatus: '', title: '', message: '' })}
        onConfirm={handleConfirmAdvance}
        title={confirmStageModal.title}
        message={confirmStageModal.message}
        confirmText="Confirm Stage Update"
        variant="primary"
      />
    </div>
  );
}
