import React, { useState, useEffect } from 'react';
import { Search, Filter, UserCheck, CheckCircle2, Clock, AlertTriangle, UserPlus, Eye, X } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import PriorityBadge from '../../../core/components/PriorityBadge/PriorityBadge';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import Button from '../../../core/components/Button/Button';
import { caManagerApi } from '../services/caManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import './CaServiceQueuePage.css';

const AVAILABLE_AGENTS = ['Suresh Kumar', 'Priya Sharma', 'Rahul Dave', 'Amit Singh'];

export default function CaServiceQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState('Suresh Kumar');
  const [assignPriority, setAssignPriority] = useState('HIGH');
  const [assignDueDate, setAssignDueDate] = useState('20 Oct 2026');
  const [assignInstructions, setAssignInstructions] = useState('');

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; item: any; targetStatus: any }>({
    isOpen: false,
    item: null,
    targetStatus: null
  });

  const loadQueue = () => {
    caManagerApi.getServiceQueue().then((data: any) => {
      setQueue(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadQueue();
    const unsubscribe = caManagerApi.subscribe(STORAGE_KEYS.TASKS, () => {
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
    setSelectedAgent(item.assignedAgent || 'Suresh Kumar');
    setAssignPriority(item.priority || 'HIGH');
    setAssignDueDate(item.dueDate || '20 Oct 2026');
    setAssignInstructions(item.instructions || 'Review compliance documents and prepare final submission filing.');
    setAssignModalOpen(true);
  };

  const handleAssignSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    await caManagerApi.assignAgent(selectedItem.id, selectedAgent, {
      priority: assignPriority,
      dueDate: assignDueDate,
      instructions: assignInstructions
    });
    loadQueue();
    setAssignModalOpen(false);
    showToast(`Case ${selectedItem.id} successfully delegated to ${selectedAgent} (${assignPriority} Priority).`, 'success');
  };

  const promptStatusChange = (item: any, newStatus: string) => {
    if (newStatus === 'FILED') {
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
    await caManagerApi.updateServiceStatus(id, newStatus);
    loadQueue();
    setConfirmModal({ isOpen: false, item: null, targetStatus: null });
    showToast(`Case ${id} status updated to ${newStatus}.`, 'success');
  };

  const filteredQueue = queue.filter((item) => {
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      (item.client?.toLowerCase() || '').includes(q) ||
      (item.serviceName?.toLowerCase() || '').includes(q) ||
      (item.id?.toLowerCase() || '').includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="tx-ca-queue-page">
      {feedback && (
        <div className={`tx-ca-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <PageHeader
        title="Filing & Compliance Service Queue"
        subtitle="Operational caseload across GST Returns, Business ITR, MCA ROC Filings, and Audits"
        breadcrumb={['CA Domain', 'Caseload', 'Service Queue']}
      />

      <div className="tx-queue-controls">
        <div className="tx-queue-search">
          <Search size={16} className="tx-search-icon" />
          <input
            type="text"
            placeholder="Search by Request ID, Client, or Service..."
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
            className={`tx-q-filter-btn ${statusFilter === 'FILED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('FILED')}
          >
            Filed / Completed
          </button>
        </div>
      </div>

      <div className="tx-queue-table-card">
        <div className="tx-table-container">
          <table className="tx-queue-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Client / Entity</th>
                <th>Compliance Service</th>
                <th>Assigned Agent</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="tx-queue-empty">
                    No filing cases found matching your filter criteria.
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
                    <td>{item.serviceName}</td>
                    <td>
                      <div className="tx-agent-cell">
                        <span>{item.assignedAgent || 'Unassigned'}</span>
                        <button
                          type="button"
                          className="tx-btn-reassign"
                          onClick={() => openAssignModal(item)}
                          title="Assign or Reallocate Agent"
                        >
                          <UserPlus size={13} />
                        </button>
                      </div>
                    </td>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td>
                      <span className="tx-q-due"><Clock size={13} />{item.dueDate}</span>
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <div className="tx-q-action-btns">
                        {item.status !== 'FILED' && (
                          <button
                            type="button"
                            className="tx-btn-quick-file"
                            onClick={() => promptStatusChange(item, 'FILED')}
                            title="Sign-off & Mark as Filed"
                          >
                            Mark Filed
                          </button>
                        )}
                        {item.status === 'ASSIGNED' && (
                          <button
                            type="button"
                            className="tx-btn-quick-progress"
                            onClick={() => promptStatusChange(item, 'IN_PROGRESS')}
                          >
                            Start
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

      {/* Assign Agent Modal */}
      {selectedItem && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Delegate Case — ${selectedItem.id}`}
        >
          <form onSubmit={handleAssignSave} className="tx-assign-form">
            <p className="tx-assign-desc">
              Assign case <strong>{selectedItem.serviceName}</strong> for client{' '}
              <strong>{selectedItem.client}</strong> to an operational tax preparer:
            </p>

            <div className="tx-form-group" style={{ margin: '16px 0' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                Select CA Senior Agent:
              </label>
              <select
                className="tx-input"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                {AVAILABLE_AGENTS.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent} (Available Capacity)
                  </option>
                ))}
              </select>
            </div>

            <div className="tx-form-group" style={{ margin: '12px 0' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                Operational Priority:
              </label>
              <select
                className="tx-input"
                value={assignPriority}
                onChange={(e) => setAssignPriority(e.target.value)}
              >
                <option value="CRITICAL">CRITICAL (Immediate Action)</option>
                <option value="URGENT">URGENT (&lt; 24h SLA)</option>
                <option value="HIGH">HIGH (Standard SLA)</option>
                <option value="MEDIUM">MEDIUM (Regular Track)</option>
                <option value="LOW">LOW (Deferred)</option>
              </select>
            </div>

            <div className="tx-form-group" style={{ margin: '12px 0' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                Filing Due Date:
              </label>
              <input
                type="text"
                className="tx-input"
                value={assignDueDate}
                onChange={(e) => setAssignDueDate(e.target.value)}
                placeholder="e.g. 20 Oct 2026"
              />
            </div>

            <div className="tx-form-group" style={{ margin: '12px 0' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                Manager Directives &amp; Instructions:
              </label>
              <textarea
                className="tx-input"
                rows={2}
                value={assignInstructions}
                onChange={(e) => setAssignInstructions(e.target.value)}
                placeholder="Provide specific filing directives to the agent..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="orange" type="submit">
                Confirm Delegation
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, item: null, targetStatus: null })}
        onConfirm={() => executeStatusUpdate(confirmModal.item?.id, confirmModal.targetStatus)}
        title="Sign-off & Complete Filing"
        message={`Mark case ${confirmModal.item?.id} (${confirmModal.item?.serviceName}) for ${confirmModal.item?.client} as officially filed with statutory authorities?`}
        variant="primary"
        confirmText="Confirm Filing"
      />
    </div>
  );
}
