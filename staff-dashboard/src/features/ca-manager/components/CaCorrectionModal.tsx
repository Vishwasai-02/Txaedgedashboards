import React from 'react';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';

interface CaCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCase: any;
  presetDeficiencies: string[];
  correctionRemarks: string;
  setCorrectionRemarks: React.Dispatch<React.SetStateAction<string>>;
  remarksError: string;
  setRemarksError: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
}

export function CaCorrectionModal({
  isOpen,
  onClose,
  selectedCase,
  presetDeficiencies,
  correctionRemarks,
  setCorrectionRemarks,
  remarksError,
  setRemarksError,
  onSubmit
}: CaCorrectionModalProps) {
  if (!isOpen || !selectedCase) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Document Resubmission — ${selectedCase.client}`}
    >
      <form onSubmit={onSubmit} className="tx-correction-form">
        <p className="tx-corr-desc">
          Specify deficiencies identified during document audit. An automated alert will be
          dispatched to executive <strong>{selectedCase.assignedAgent}</strong> and the client:
        </p>

        <div className="tx-preset-chips-group">
          <span className="tx-preset-title">Quick Deficiency Presets:</span>
          <div className="tx-chips-list">
            {presetDeficiencies.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="tx-preset-chip"
                onClick={() => {
                  setCorrectionRemarks((prev) => (prev ? `${prev}\n• ${preset}` : preset));
                  setRemarksError('');
                }}
              >
                + {preset.slice(0, 38)}...
              </button>
            ))}
          </div>
        </div>

        <div className="tx-form-group" style={{ margin: '14px 0' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
            Deficiency Remarks &amp; Required Corrections *
          </label>
          <textarea
            rows={4}
            className={`tx-input ${remarksError ? 'is-invalid' : ''}`}
            placeholder="e.g. Electricity bill is older than 2 months; please request latest August or September utility bill copy."
            value={correctionRemarks}
            onChange={(e) => {
              setCorrectionRemarks(e.target.value);
              if (remarksError) setRemarksError('');
            }}
          />
          {remarksError && <span className="tx-error-text">{remarksError}</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="orange" type="submit">
            Dispatch Correction Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CaCorrectionModal;
