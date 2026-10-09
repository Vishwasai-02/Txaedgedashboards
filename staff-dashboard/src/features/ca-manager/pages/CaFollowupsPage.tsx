import React, { useState, useEffect } from 'react';
import { PhoneCall, MessageSquare, CheckCircle2, Clock, Phone, AlertCircle, X, Search, Edit3 } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';
import { caManagerApi } from '../services/caManagerApi';
import './CaFollowupsPage.css';

export default function CaFollowupsPage() {
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
    outcome: 'Connected — Client promised documents by tomorrow',
    notes: ''
  });
  const [logError, setLogError] = useState('');

  useEffect(() => {
    caManagerApi.getFollowups().then((data) => {
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
      outcome: 'Connected — Client promised documents by tomorrow',
      notes: ''
    });
    setLogError('');
  };

  const handleSaveCallNotes = (e: React.FormEvent) => {
    e.preventDefault();
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
    setLogCallModal({ isOpen: false, item: null, outcome: '', notes: '' });
    showToast(`Call logged successfully for ${logCallModal.item.client}.`, 'success');
  };

  const handleSendPing = (item: any) => {
    showToast(
      `SMS & WhatsApp ping dispatched to ${item.contactPerson} (${item.phone}) regarding: "${item.reason}".`,
      'info'
    );
  };

  const handleResolve = (id: string) => {
    setFollowups(
      followups.map((f: any) => (f.id === id ? { ...f, status: 'RESOLVED' } : f))
    );
    showToast('Client follow-up marked as resolved.', 'success');
  };

  const filteredFollowups = followups.filter((item: any) => {
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      (item.client?.toLowerCase() || '').includes(q) ||
      (item.contactPerson?.toLowerCase() || '').includes(q) ||
      (item.id?.toLowerCase() || '').includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="tx-ca-followups-page">
      <PageHeader
        title="Client Document & OTP Follow-ups"
        subtitle="Manage pending client interventions for missing proofs, EVC verification OTPs, and DSC renewals"
        breadcrumb={['CA Domain', 'Outreach', 'Follow-ups']}
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

      <div className="tx-fup-controls" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div className="tx-fup-search" style={{ display: 'flex', alignItems: 'center', background: 'var(--tx-surface)', border: '1px solid var(--tx-border)', borderRadius: '8px', padding: '6px 12px', minWidth: '260px' }}>
          <Search size={16} color="var(--tx-muted-text)" />
          <input
            type="text"
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '8px', width: '100%', fontSize: '13px' }}
            placeholder="Search by client or contact person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="tx-fup-filter-pills" style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`tx-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Interventions ({followups.length})
          </button>
          <button
            type="button"
            className={`tx-filter-pill ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
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
          <div className="tx-fup-empty" style={{ textAlign: 'center', padding: '40px', background: 'var(--tx-surface)', borderRadius: '8px', border: '1px solid var(--tx-border)' }}>
            <p style={{ color: 'var(--tx-muted-text)' }}>No client follow-ups match your filter.</p>
          </div>
        ) : (
          filteredFollowups.map((item: any) => (
            <div key={item.id} className="tx-fup-card">
              <div className="tx-fup-header">
                <div className="tx-fup-client-info">
                  <span className="tx-fup-id">{item.id}</span>
                  <h3 className="tx-fup-client">{item.client}</h3>
                  <span className="tx-fup-person">
                    Contact: <strong>{item.contactPerson}</strong> ({item.phone})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusBadge status={item.status} />
                  <span className={`tx-urgency-badge ${item.severity?.toLowerCase() || 'medium'}`}>
                    {item.severity || 'HIGH'}
                  </span>
                </div>
              </div>

              <div className="tx-fup-body">
                <p className="tx-fup-reason">
                  <AlertCircle size={15} style={{ display: 'inline', marginRight: '6px', color: '#E65100' }} />
                  {item.reason}
                </p>
                {item.notes && (
                  <p style={{ fontSize: '12px', background: 'var(--tx-background)', padding: '6px 10px', borderRadius: '4px', marginTop: '6px' }}>
                    <strong>Last Call Note:</strong> {item.notes}
                  </p>
                )}
                <div className="tx-fup-meta">
                  <span>Last Attempt: {item.lastContacted || '2 hours ago'}</span>
                  <span>Assigned Agent: {item.assignedAgent || 'Suresh Kumar'}</span>
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
          title={`Log Outbound Call Notes — ${logCallModal.item?.client}`}
        >
          <form onSubmit={handleSaveCallNotes} className="tx-call-log-form">
            <p style={{ fontSize: '13px', color: 'var(--tx-secondary-text)', marginBottom: '16px' }}>
              Record discussion outcome with <strong>{logCallModal.item?.contactPerson}</strong> ({logCallModal.item?.phone}):
            </p>

            <div className="tx-form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Call Outcome *
              </label>
              <select
                className="tx-input"
                value={logCallModal.outcome}
                onChange={(e) => setLogCallModal({ ...logCallModal, outcome: e.target.value })}
              >
                <option value="Connected — Client promised documents by tomorrow">Connected — Promised documents by tomorrow</option>
                <option value="Connected — Client verified OTP on call">Connected — Client verified OTP on call</option>
                <option value="No Answer — Left voicemail & WhatsApp ping">No Answer — Left voicemail & WhatsApp ping</option>
                <option value="Wrong Number / Number Unreachable">Wrong Number / Number Unreachable</option>
              </select>
            </div>

            <div className="tx-form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Conversation Notes &amp; Action Item *
              </label>
              <textarea
                rows={3}
                className={`tx-input ${logError ? 'is-invalid' : ''}`}
                placeholder="Detail client response and next action..."
                value={logCallModal.notes}
                onChange={(e) => setLogCallModal({ ...logCallModal, notes: e.target.value })}
              />
              {logError && <span className="tx-error-text">{logError}</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
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
