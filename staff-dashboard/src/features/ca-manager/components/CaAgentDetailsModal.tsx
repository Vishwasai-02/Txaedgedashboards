import React from 'react';
import { Trash2, MessageSquare } from 'lucide-react';
import Modal from '../../../core/components/Modal/Modal';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import Button from '../../../core/components/Button/Button';

interface CaAgentDetailsModalProps {
  agent: any;
  onClose: () => void;
  onRemove: (agent: any) => void;
  onMessage: (agent: any) => void;
}

export function CaAgentDetailsModal({ agent, onClose, onRemove, onMessage }: CaAgentDetailsModalProps) {
  if (!agent) return null;

  return (
    <Modal
      isOpen={!!agent}
      onClose={onClose}
      title={`CA Agent Details — ${agent.name}`}
    >
      <div className="tx-agent-details-modal-content">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#083B75',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '18px'
              }}
            >
              {agent.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
                {agent.name}
              </h3>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {agent.id} • {agent.role}
              </span>
            </div>
          </div>
          <StatusBadge status={agent.status || 'ACTIVE'} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Official Email</span>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>{agent.email}</strong>
          </div>
          <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Contact Phone</span>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>{agent.phone}</strong>
          </div>
          <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Assigned Department</span>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>{agent.department || 'CA Operations'}</strong>
          </div>
          <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Assigned Supervisor</span>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>CA Sanjay Verma, FCA (Lead Manager)</strong>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '18px',
            textAlign: 'center'
          }}
        >
          <div style={{ padding: '12px 8px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#1d4ed8', display: 'block' }}>{agent.activeCases || 0}</span>
            <span style={{ fontSize: '12px', color: '#475569' }}>Active Caseload</span>
          </div>
          <div style={{ padding: '12px 8px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#15803d', display: 'block' }}>{agent.completedCases || 18}</span>
            <span style={{ fontSize: '12px', color: '#475569' }}>Cleared MTD</span>
          </div>
          <div style={{ padding: '12px 8px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#b45309', display: 'block' }}>★ {agent.rating || 4.8}</span>
            <span style={{ fontSize: '12px', color: '#475569' }}>Satisfaction CSAT</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
          <Button
            variant="danger"
            onClick={() => onRemove(agent)}
          >
            <Trash2 size={14} style={{ marginRight: '6px' }} />
            <span>Remove Agent</span>
          </Button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="orange"
              onClick={() => onMessage(agent)}
            >
              <MessageSquare size={14} style={{ marginRight: '6px' }} />
              <span>Communication</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CaAgentDetailsModal;
