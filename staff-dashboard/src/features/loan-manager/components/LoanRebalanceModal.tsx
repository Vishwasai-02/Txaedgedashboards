import React from 'react';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';

interface LoanRebalanceModalProps {
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

export function LoanRebalanceModal({
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
}: LoanRebalanceModalProps) {
  if (!isOpen || !selectedAgent) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rebalance Caseload — ${selectedAgent.name}`}
    >
      <form onSubmit={onSubmit} className="tx-reassign-form">
        <p className="tx-reassign-desc">
          Transfer active credit underwriting cases from <strong>{selectedAgent.name}</strong> to another available executive:
        </p>

        {formError && <div className="tx-form-error-banner">{formError}</div>}

        <div className="tx-form-group">
          <label>Target Credit Agent</label>
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

        <div className="tx-form-group">
          <label>Number of Cases to Transfer</label>
          <input
            type="number"
            min="1"
            max={selectedAgent.activeCases}
            className="tx-input"
            value={casesToTransfer}
            onChange={(e) => setCasesToTransfer(parseInt(e.target.value, 10) || 1)}
          />
        </div>

        <div className="tx-modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="orange" type="submit">
            Confirm Rebalance
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default LoanRebalanceModal;
