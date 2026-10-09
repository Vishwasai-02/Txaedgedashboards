import React from 'react';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';

interface LoanAddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    name: string;
    email: string;
    phone: string;
    role: string;
    activeCases: number | string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoanAddAgentModal({
  isOpen,
  onClose,
  form,
  setForm,
  errors,
  onSubmit
}: LoanAddAgentModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New Loan Agent"
    >
      <form onSubmit={onSubmit} className="tx-add-agent-form">
        <div className="tx-form-group">
          <label>Agent Full Name *</label>
          <input
            type="text"
            className={`tx-input ${errors.name ? 'is-invalid' : ''}`}
            placeholder="e.g. Vikram Joshi"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <span className="tx-error-text">{errors.name}</span>}
        </div>

        <div className="tx-form-group">
          <label>Corporate Email *</label>
          <input
            type="email"
            className={`tx-input ${errors.email ? 'is-invalid' : ''}`}
            placeholder="e.g. vikram.j@taxedge.in"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <span className="tx-error-text">{errors.email}</span>}
        </div>

        <div className="tx-form-row">
          <div className="tx-form-group">
            <label>Verified Contact Phone *</label>
            <input
              type="text"
              className={`tx-input ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="+91 98200 44556"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {errors.phone && <span className="tx-error-text">{errors.phone}</span>}
          </div>

          <div className="tx-form-group">
            <label>Initial Caseload Capacity</label>
            <input
              type="number"
              min="0"
              max="15"
              className="tx-input"
              value={form.activeCases}
              onChange={(e) => setForm({ ...form, activeCases: e.target.value })}
            />
          </div>
        </div>

        <div className="tx-form-group">
          <label>Underwriting Specialization Role</label>
          <select
            className="tx-input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="Business Loan Credit Executive">Business Loan Credit Executive</option>
            <option value="Housing Loan Underwriting Officer">Housing Loan Underwriting Officer</option>
            <option value="MSME Machinery & Asset Appraisal Specialist">MSME Machinery & Asset Appraisal Specialist</option>
            <option value="Loan Against Property (LAP) Risk Assessor">Loan Against Property (LAP) Risk Assessor</option>
            <option value="Personal & Professional Credit Underwriter">Personal & Professional Credit Underwriter</option>
          </select>
        </div>

        <div className="tx-modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="orange" type="submit">
            Onboard Loan Agent
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default LoanAddAgentModal;
