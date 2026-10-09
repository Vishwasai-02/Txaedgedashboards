import React, { useState, useEffect } from 'react';
import { Search, Filter, UserCheck, CheckCircle2, Clock, AlertTriangle, UserPlus, Eye, X, Banknote } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import PriorityBadge from '../../../core/components/PriorityBadge/PriorityBadge';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import Button from '../../../core/components/Button/Button';
import { loanManagerApi } from '../services/loanManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import './LoanServiceQueuePage.css';

const AVAILABLE_LOAN_AGENTS = ['Rajesh Patel', 'Kavita Iyer'];

export default function LoanServiceQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState('Rajesh Patel');
  const [assignPriority, setAssignPriority] = useState('HIGH');
  const [assignDueDate, setAssignDueDate] = useState('20 Oct 2026');
  const [assignInstructions, setAssignInstructions] = useState('');

  // Inspection modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectedItem, setInspectedItem] = useState<any>(null);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    item: any;
    targetStatus: string | null;
  }>({
    isOpen: false,
    item: null,
    targetStatus: null
  });

  const loadQueue = () => {
    loanManagerApi.getServiceQueue().then((data: any) => {
      setQueue(data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadQueue();
    const unsubscribe = loanManagerApi.subscribe(() => {
      loadQueue();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const openAssignModal = (item: any) => {
    setSelectedItem(item);
    setSelectedAgent(item.assignedAgent || 'Rajesh Patel');
    setAssignPriority(item.priority || 'HIGH');
    setAssignDueDate(item.dueDate || '20 Oct 2026');
    setAssignInstructions(item.instructions || 'Review borrower documents and complete credit appraisal memo.');
    setAssignModalOpen(true);
  };

  const handleAssignSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    await loanManagerApi.assignAgent(selectedItem.id, selectedAgent, {
      priority: assignPriority,
      dueDate: assignDueDate,
      instructions: assignInstructions
    });
    loadQueue();
    setAssignModalOpen(false);
    showToast(`Loan Case ${selectedItem.id} delegated to credit executive ${selectedAgent} (${assignPriority} Priority).`, 'success');
  };

  const promptStatusChange = (item: any, newStatus: string) => {
    if (newStatus === 'DISBURSED') {
      setConfirmModal({
        isOpen: true,
        item,
        targetStatus: newStatus
      });
    } else {
      executeStatusUpdate(item.id, newStatus);
    }
  };

  const executeStatusUpdate = async (id: string, newStatus: string) => {
    await loanManagerApi.updateServiceStatus(id, newStatus);
    loadQueue();
    setConfirmModal({ isOpen: false, item: null, targetStatus: null });
    showToast(`Loan case ${id} status transitioned to ${newStatus}.`, 'success');
  };

  const openInspectModal = (item: any) => {
    setInspectedItem(item);
    setInspectModalOpen(true);
  };

  const filteredQueue = queue.filter((item: any) => {
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      (item.client?.toLowerCase() || '').includes(q) ||
      (item.serviceName?.toLowerCase() || '').includes(q) ||
      (item.id?.toLowerCase() || '').includes(q) ||
      (item.assignedAgent?.toLowerCase() || '').includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="tx-loan-queue-page">
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
        title="Lending Service & Appraisal Queue"
        subtitle="Manage underwriting pipeline, document appraisals, credit assessments, and sanction disbursements"
        breadcrumb={['Loan Domain', 'Caseload', 'Service Queue']}
      />

      <div className="tx-queue-controls">
        <div className="tx-queue-search">
          <Search size={16} className="tx-search-icon" />
          <input
            type="text"
            placeholder="Search by Request ID, Borrower, or Facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="tx-clear-search-btn"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="tx-queue-status-filters">
          <button
            type="button"
            className={`tx-q-filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Caseload ({queue.length})
          </button>
          <button
            type="button"
            className={`tx-q-filter-btn ${statusFilter === 'ASSIGNED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ASSIGNED')}
          >
            Assigned
          </button>
          <button
            type="button"
            className={`tx-q-filter-btn ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
            onClick={() => setStatusFilter('IN_PROGRESS')}
          >
            In Progress
          </button>
          <button
            type="button"
            className={`tx-q-filter-btn ${statusFilter === 'PENDING_REVIEW' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING_REVIEW')}
          >
            Review Required
          </button>
          <button
            type="button"
            className={`tx-q-filter-btn ${statusFilter === 'DISBURSED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('DISBURSED')}
          >
            Disbursed
          </button>
        </div>
      </div>

      <div className="tx-queue-table-card">
        <div className="tx-table-container">
          <table className="tx-queue-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Borrower / Enterprise</th>
                <th>Loan Facility & Amount</th>
                <th>Credit Agent</th>
                <th>Priority</th>
                <th>Target SLA</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="tx-queue-empty">
                    No lending cases found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => (
                  <tr key={item.id}>
                    <td><strong className="tx-q-id">{item.id}</strong></td>
                    <td>
                      <div>
                        <strong>{item.client}</strong>
                        <span className="tx-q-sub">{item.clientPan}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{item.serviceName}</span>
                        <span className="tx-loan-amt-badge">{item.loanAmount}</span>
                      </div>
                    </td>
                    <td>
                      <div className="tx-agent-cell">
                        <span>{item.assignedAgent || 'Unassigned'}</span>
                        <button
                          type="button"
                          className="tx-btn-reassign"
                          onClick={() => openAssignModal(item)}
                          title="Assign or Reallocate Credit Agent"
                        >
                          <UserPlus size={13} />
                        </button>
                      </div>
                    </td>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td>
                      <div className="tx-due-cell">
                        <Clock size={13} className="tx-due-icon" />
                        <span>{item.dueDate}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <div className="tx-action-cell">
                        <button
                          type="button"
                          className="tx-btn-action-view"
                          onClick={() => openInspectModal(item)}
                          title="Inspect Loan Appraisal Case"
                        >
                          <Eye size={14} />
                        </button>

                        {item.status === 'ASSIGNED' && (
                          <button
                            type="button"
                            className="tx-btn-action-start"
                            onClick={() => promptStatusChange(item, 'IN_PROGRESS')}
                            title="Start Appraisal"
                          >
                            Start
                          </button>
                        )}

                        {item.status === 'IN_PROGRESS' && (
                          <button
                            type="button"
                            className="tx-btn-action-review"
                            onClick={() => promptStatusChange(item, 'PENDING_REVIEW')}
                            title="Submit for Underwriting Sign-off"
                          >
                            Sign-off
                          </button>
                        )}

                        {item.status === 'PENDING_REVIEW' && (
                          <button
                            type="button"
                            className="tx-btn-action-file"
                            onClick={() => promptStatusChange(item, 'DISBURSED')}
                            title="Confirm Payout / Disbursement"
                          >
                            Disburse
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Agent Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Delegate Loan Case — ${selectedItem?.id}`}
      >
        <form onSubmit={handleAssignSave} className="tx-assign-form">
          <p className="tx-assign-desc">
            Assign loan underwriting case <strong>{selectedItem?.client}</strong> to a credit executive:
          </p>

          <div className="tx-form-group">
            <label>Credit Executive</label>
            <select
              className="tx-input"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              {AVAILABLE_LOAN_AGENTS.map((agent) => (
                <option key={agent} value={agent}>
                  {agent} (Credit Underwriting Desk)
                </option>
              ))}
            </select>
          </div>

          <div className="tx-form-row">
            <div className="tx-form-group">
              <label>Appraisal Priority</label>
              <select
                className="tx-input"
                value={assignPriority}
                onChange={(e) => setAssignPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="tx-form-group">
              <label>SLA Target Due Date</label>
              <input
                type="text"
                className="tx-input"
                value={assignDueDate}
                onChange={(e) => setAssignDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="tx-form-group">
            <label>Underwriting Instructions</label>
            <textarea
              rows={3}
              className="tx-input"
              value={assignInstructions}
              onChange={(e) => setAssignInstructions(e.target.value)}
              placeholder="e.g. Verify consortium banker NOC and audited financial ratios."
            />
          </div>

          <div className="tx-modal-actions">
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Confirm Delegation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Case Details Inspection Modal */}
      {inspectedItem && (
        <Modal
          isOpen={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          title={`Loan Appraisal Dossier — ${inspectedItem.id}`}
        >
          <div className="tx-inspect-content">
            <div className="tx-inspect-grid">
              <div className="tx-inspect-item">
                <span className="tx-inspect-label">Borrower</span>
                <strong className="tx-inspect-val">{inspectedItem.client}</strong>
              </div>
              <div className="tx-inspect-item">
                <span className="tx-inspect-label">PAN / Registration</span>
                <strong className="tx-inspect-val">{inspectedItem.clientPan}</strong>
              </div>
              <div className="tx-inspect-item">
                <span className="tx-inspect-label">Facility</span>
                <strong className="tx-inspect-val">{inspectedItem.serviceName}</strong>
              </div>
              <div className="tx-inspect-item">
                <span className="tx-inspect-label">Sanction / Loan Quantum</span>
                <strong className="tx-inspect-val" style={{ color: '#059669' }}>{inspectedItem.loanAmount}</strong>
              </div>
              <div className="tx-inspect-item">
                <span className="tx-inspect-label">Assigned Executive</span>
                <strong className="tx-inspect-val">{inspectedItem.assignedAgent}</strong>
              </div>
              <div className="tx-inspect-item">
                <span className="tx-inspect-label">Current Stage</span>
                <StatusBadge status={inspectedItem.status} />
              </div>
            </div>

            <div className="tx-inspect-instructions">
              <span className="tx-inspect-label">Underwriting Remarks & Instructions:</span>
              <p>{inspectedItem.instructions || 'Standard KYC and credit ratio underwriting protocol.'}</p>
            </div>

            <div className="tx-modal-actions" style={{ marginTop: '20px' }}>
              <Button variant="secondary" onClick={() => setInspectModalOpen(false)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Disbursement Release Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, item: null, targetStatus: null })}
        onConfirm={() => confirmModal.item && executeStatusUpdate(confirmModal.item.id, confirmModal.targetStatus || 'DISBURSED')}
        title="Confirm Disbursement Release"
        message={`Authorize payout and disbursement release for ${confirmModal.item?.client} (${confirmModal.item?.loanAmount})?`}
        variant="primary"
        confirmText="Release Funds"
      />
    </div>
  );
}
