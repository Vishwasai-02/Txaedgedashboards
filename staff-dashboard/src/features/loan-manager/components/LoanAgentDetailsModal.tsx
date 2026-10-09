import React from 'react';
import { Trash2, MessageSquare } from 'lucide-react';
import Modal from '../../../core/components/Modal/Modal';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import Button from '../../../core/components/Button/Button';

interface LoanAgentDetailsModalProps {
  agent: any;
  onClose: () => void;
  onRemove: (agent: any) => void;
  onMessage: (agent: any) => void;
}

export function LoanAgentDetailsModal({
  agent,
  onClose,
  onRemove,
  onMessage
}: LoanAgentDetailsModalProps) {
  if (!agent) return null;

  return (
    <Modal
      isOpen={!!agent}
      onClose={onClose}
      title={`Loan Agent Details — ${agent.name}`}
    >
      <div className="tx-agent-details-modal-content">
        <div className="tx-agent-dossier-banner">
          <div className="tx-dossier-profile">
            <div className="tx-dossier-avatar">
              {agent.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h3 className="tx-dossier-name">{agent.name}</h3>
              <span className="tx-dossier-sub">
                {agent.id} • {agent.role}
              </span>
            </div>
          </div>
          <StatusBadge status={agent.status || 'ACTIVE'} />
        </div>

        <div className="tx-dossier-meta-grid">
          <div className="tx-dossier-meta-card">
            <span className="tx-dossier-meta-lbl">Official Email</span>
            <strong className="tx-dossier-meta-val">{agent.email}</strong>
          </div>
          <div className="tx-dossier-meta-card">
            <span className="tx-dossier-meta-lbl">Contact Phone</span>
            <strong className="tx-dossier-meta-val">{agent.phone}</strong>
          </div>
          <div className="tx-dossier-meta-card">
            <span className="tx-dossier-meta-lbl">Assigned Department</span>
            <strong className="tx-dossier-meta-val">{agent.department || 'Credit Underwriting'}</strong>
          </div>
          <div className="tx-dossier-meta-card">
            <span className="tx-dossier-meta-lbl">Assigned Supervisor</span>
            <strong className="tx-dossier-meta-val">Ananya Deshmukh (MGR002)</strong>
          </div>
        </div>

        <div className="tx-dossier-stats-row">
          <div className="tx-dossier-stat-box blue">
            <span className="tx-stat-num">{agent.activeCases || 0}</span>
            <span className="tx-stat-lbl">Active Loan Files</span>
          </div>
          <div className="tx-dossier-stat-box green">
            <span className="tx-stat-num">{agent.completedMonth || 15}</span>
            <span className="tx-stat-lbl">Sanctioned MTD</span>
          </div>
          <div className="tx-dossier-stat-box amber">
            <span className="tx-stat-num">★ {agent.rating || 4.8}</span>
            <span className="tx-stat-lbl">Satisfaction CSAT</span>
          </div>
        </div>

        <div className="tx-dossier-actions-bar">
          <Button
            variant="danger"
            onClick={() => onRemove(agent)}
          >
            <Trash2 size={14} style={{ marginRight: '6px' }} />
            <span>Remove Agent</span>
          </Button>
          <div className="tx-dossier-actions-right">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="orange"
              onClick={() => onMessage(agent)}
            >
              <MessageSquare size={14} style={{ marginRight: '6px' }} />
              <span>Message Agent</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default LoanAgentDetailsModal;
