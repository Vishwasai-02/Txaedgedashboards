import React from 'react';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';

interface CaRebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgent: any;
  team: any[];
  casesToTransfer: number;
  setCasesToTransfer: (num: number) => void;
  transferTarget: string;
  setTransferTarget: (target: string) => void;
  formError: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function CaRebalanceModal({
  isOpen,
  onClose,
  selectedAgent,
  team,
  casesToTransfer,
  setCasesToTransfer,
  transferTarget,
  setTransferTarget,
  formError,
  onSubmit
}: CaRebalanceModalProps) {
  if (!isOpen || !selectedAgent) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rebalance Workload — ${selectedAgent.name}`}
    >
      <form onSubmit={onSubmit} className="tx-reassign-form">
        <p className="tx-reassign-desc">
          Transfer active filing load from <strong>{selectedAgent.name}</strong> (Currently holding{' '}
          {selectedAgent.activeCases} cases) to another executive:
        </p>

        <div className="tx-form-group" style={{ margin: '16px 0' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
            Cases to Transfer:
          </label>
          <input
            type="number"
            min="1"
            max={selectedAgent.activeCases || 1}
            className="tx-input"
            value={casesToTransfer}
            onChange={(e) => setCasesToTransfer(Number(e.target.value))}
          />
        </div>

        <div className="tx-form-group" style={{ margin: '16px 0' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
            Target Executive:
          </label>
          <select
            className="tx-input"
            value={transferTarget}
            onChange={(e) => setTransferTarget(e.target.value)}
          >
            {team
              .filter((m) => m.id !== selectedAgent.id)
              .map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.activeCases} active cases)
                </option>
              ))}
          </select>
        </div>

        {formError && (
          <span className="tx-error-text" style={{ display: 'block', marginBottom: '12px' }}>
            {formError}
          </span>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="orange" type="submit">
            Execute Rebalancing
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CaRebalanceModal;
