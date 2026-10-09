import React, { useState, useEffect } from 'react';
import { PhoneCall, MessageSquare, CheckCircle2, Clock, Phone, AlertCircle, X, Search, Edit3, Banknote } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';
import { loanManagerApi } from '../services/loanManagerApi';
import './LoanFollowupsPage.css';

export default function LoanFollowupsPage() {
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  // Call logging modal
  const [logCallModal, setLogCallModal] = useState<{
    isOpen: boolean;
    item: any;
    outcome: string;
    notes: string;
  }>({
    isOpen: false,
    item: null,
    outcome: 'Connected — Borrower promised sign-off by tomorrow',
    notes: ''
  });
  const [logError, setLogError] = useState('');

  useEffect(() => {
    loanManagerApi.getFollowups().then((data: any[]) => {
      setFollowups(data);
      setLoading(false);
    });
  }, []);

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSimulateCall = (item: any) => {
    setLogCallModal({
      isOpen: true,
      item,
      outcome: 'Connected — Borrower promised sign-off by tomorrow',
      notes: ''
    });
    setLogError('');
  };

  const handleSaveCallNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logCallModal.item) return;
    if (!logCallModal.notes.trim() || logCallModal.notes.trim().length < 5) {
      setLogError('Call notes must be at least 5 characters.');
      return;
    }

    const updated = followups.map((f: any) =>
      f.id === logCallModal.item.id
        ? {
            ...f,
            lastContacted: 'Just now',
            notes: `${logCallModal.outcome} — ${logCallModal.notes}`
          }
        : f
    );
    setFollowups(updated);
    showToast(`Call entry recorded for borrower ${logCallModal.item.client}.`, 'success');
    setLogCallModal({ isOpen: false, item: null, outcome: '', notes: '' });
  };

  const handleSendPing = (item: any) => {
    showToast(
      `SMS & WhatsApp reminder dispatched to ${item.contactPerson} (${item.phone}) regarding: "${item.reason}".`,
      'info'
    );
  };

  const handleResolve = (id: string) => {
    setFollowups(
      followups.map((f: any) => (f.id === id ? { ...f, status: 'RESOLVED' } : f))
    );
    showToast('Borrower intervention item marked as resolved.', 'success');
  };

  const filteredFollowups = followups.filter((item: any) => {
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      (item.client?.toLowerCase() || '').includes(q) ||
      (item.contactPerson?.toLowerCase() || '').includes(q) ||
      (item.facility?.toLowerCase() || '').includes(q) ||
      (item.id?.toLowerCase() || '').includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="tx-loan-followups-page">
      <PageHeader
        title="Borrower & Underwriting Follow-ups"
        subtitle="Manage borrower interventions for pending sanction sign-offs, consortium NOCs, NACH mandates, and disbursement conditions"
        breadcrumb={['Loan Domain', 'Outreach', 'Follow-ups']}
      />

      {toast && (
        <div className={`tx-fup-toast ${toast.type}`}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-fup-controls">
        <div className="tx-fup-search">
          <Search size={16} className="tx-search-icon" />
          <input
            type="text"
            placeholder="Search by borrower, contact person, or facility..."
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

        <div className="tx-fup-filter-pills">
          <button
            type="button"
            className={`tx-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Interventions ({followups.length})
          </button>
          <button
            type="button"
            className={`tx-filter-pill ${statusFilter === 'PENDING_RESPONSE' || statusFilter === 'FOLLOW_UP_SCHEDULED' ? 'active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'PENDING_RESPONSE' ? 'ALL' : 'PENDING_RESPONSE')}
          >
            Pending Action
          </button>
          <button
            type="button"
            className={`tx-filter-pill ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('RESOLVED')}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="tx-followups-list">
        {filteredFollowups.length === 0 ? (
          <div className="tx-fup-empty">
            <p>No borrower follow-ups match your filter criteria.</p>
          </div>
        ) : (
          filteredFollowups.map((item) => (
            <div key={item.id} className="tx-fup-card">
              <div className="tx-fup-header">
                <div className="tx-fup-client-info">
                  <span className="tx-fup-id">{item.id}</span>
                  <h3 className="tx-fup-client">{item.client}</h3>
                  <span className="tx-fup-person">
                    Borrower Rep: <strong>{item.contactPerson}</strong> ({item.phone})
                  </span>
                  {item.facility && (
                    <span className="tx-fup-facility-tag">{item.facility}</span>
                  )}
                </div>
                <div className="tx-fup-status-wrap">
                  <StatusBadge status={item.status} />
                  <span className={`tx-urgency-badge ${item.status === 'RESOLVED' ? 'low' : 'high'}`}>
                    {item.channel || 'PHONE'}
                  </span>
                </div>
              </div>

              <div className="tx-fup-body">
                <p className="tx-fup-reason">
                  <AlertCircle size={15} className="tx-reason-icon" />
                  <span>{item.reason}</span>
                </p>
                {item.notes && (
                  <div className="tx-fup-call-note">
                    <strong>Last Call Entry:</strong> {item.notes}
                  </div>
                )}
                <div className="tx-fup-meta">
                  <span>Last Outreach: {item.lastAttempt || 'Today'}</span>
                  <span>Supervisor: Ananya Deshmukh (Loan Desk)</span>
                </div>
              </div>

              <div className="tx-fup-footer">
                <button
                  type="button"
                  className="tx-btn-fup-call"
                  onClick={() => handleSimulateCall(item)}
                >
                  <Phone size={14} />
                  <span>Call &amp; Log Notes</span>
                </button>
                <button
                  type="button"
                  className="tx-btn-fup-ping"
                  onClick={() => handleSendPing(item)}
                >
                  <MessageSquare size={14} />
                  <span>Send SMS/WhatsApp Ping</span>
                </button>
                {item.status !== 'RESOLVED' && (
                  <button
                    type="button"
                    className="tx-btn-fup-resolve"
                    onClick={() => handleResolve(item.id)}
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Call Notes Modal */}
      {logCallModal.isOpen && (
        <Modal
          isOpen={logCallModal.isOpen}
          onClose={() => setLogCallModal({ isOpen: false, item: null, outcome: '', notes: '' })}
          title={`Log Outbound Outreach — ${logCallModal.item?.client}`}
        >
          <form onSubmit={handleSaveCallNotes} className="tx-call-log-form">
            <p className="tx-log-desc">
              Record underwriting conversation with <strong>{logCallModal.item?.contactPerson}</strong> ({logCallModal.item?.phone}):
            </p>

            <div className="tx-form-group">
              <label>Outreach Outcome *</label>
              <select
                className="tx-input"
                value={logCallModal.outcome}
                onChange={(e) => setLogCallModal({ ...logCallModal, outcome: e.target.value })}
              >
                <option value="Connected — Borrower promised sign-off by tomorrow">Connected — Promised sign-off by tomorrow</option>
                <option value="Connected — Consortium Banker NOC confirmed received">Connected — Consortium Banker NOC confirmed received</option>
                <option value="Connected — NACH mandate query resolved on call">Connected — NACH mandate query resolved on call</option>
                <option value="No Answer — Left voicemail & WhatsApp reminder">No Answer — Left voicemail & WhatsApp reminder</option>
                <option value="Borrower Requested Callback at Later Time">Borrower Requested Callback at Later Time</option>
              </select>
            </div>

            <div className="tx-form-group">
              <label>Conversation Notes &amp; Next Action *</label>
              <textarea
                rows={3}
                className={`tx-input ${logError ? 'is-invalid' : ''}`}
                placeholder="Detail borrower response, agreed deadline, or documents submitted..."
                value={logCallModal.notes}
                onChange={(e) => setLogCallModal({ ...logCallModal, notes: e.target.value })}
              />
              {logError && <span className="tx-error-text">{logError}</span>}
            </div>

            <div className="tx-modal-actions">
              <Button
                variant="secondary"
                onClick={() => setLogCallModal({ isOpen: false, item: null, outcome: '', notes: '' })}
              >
                Cancel
              </Button>
              <Button variant="orange" type="submit">
                Save Call Entry
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
