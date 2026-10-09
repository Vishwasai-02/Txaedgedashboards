import React from 'react';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';

interface LoanLeadAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    name: string;
    business: string;
    category: string;
    requestedAmount: string;
    phone: string;
    email: string;
    source: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoanLeadAddModal({
  isOpen,
  onClose,
  form,
  setForm,
  errors,
  onSubmit
}: LoanLeadAddModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ingest New Borrower Lead"
    >
      <form onSubmit={onSubmit} className="tx-lead-form">
        <div className="tx-lead-form-group">
          <label>Borrower / Business Entity Legal Name *</label>
          <input
            type="text"
            className={`tx-input ${errors.name ? 'is-invalid' : ''}`}
            placeholder="e.g. Zenith Precision Parts LLP"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <span className="tx-error-text">{errors.name}</span>}
        </div>

        <div className="tx-lead-form-row">
          <div className="tx-lead-form-group">
            <label>Business / Industry Sector *</label>
            <input
              type="text"
              className={`tx-input ${errors.business ? 'is-invalid' : ''}`}
              placeholder="e.g. CNC Component Manufacturing"
              value={form.business}
              onChange={(e) => setForm({ ...form, business: e.target.value })}
            />
            {errors.business && <span className="tx-error-text">{errors.business}</span>}
          </div>

          <div className="tx-lead-form-group">
            <label>Loan Product Category *</label>
            <select
              className="tx-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="MSME">MSME Expansion Loan</option>
              <option value="RETAIL">Retail Mortgage &amp; Home Loan</option>
              <option value="WORKING_CAPITAL">Working Capital CC/OD</option>
            </select>
          </div>
        </div>

        <div className="tx-lead-form-row">
          <div className="tx-lead-form-group">
            <label>Requested Capital (₹) *</label>
            <input
              type="number"
              min="50000"
              className={`tx-input ${errors.requestedAmount ? 'is-invalid' : ''}`}
              placeholder="2500000"
              value={form.requestedAmount}
              onChange={(e) => setForm({ ...form, requestedAmount: e.target.value })}
            />
            {errors.requestedAmount && <span className="tx-error-text">{errors.requestedAmount}</span>}
          </div>

          <div className="tx-lead-form-group">
            <label>Sourcing Channel</label>
            <select
              className="tx-input"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            >
              <option value="Direct Ingestion">Direct Portal Ingestion</option>
              <option value="CA Referral">CA Partner Referral</option>
              <option value="Bank Channel">Bank DSA Syndicate</option>
            </select>
          </div>
        </div>

        <div className="tx-lead-form-row">
          <div className="tx-lead-form-group">
            <label>Contact Phone (10 digits) *</label>
            <input
              type="tel"
              maxLength={10}
              className={`tx-input ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="9820011223"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {errors.phone && <span className="tx-error-text">{errors.phone}</span>}
          </div>

          <div className="tx-lead-form-group">
            <label>Email Address *</label>
            <input
              type="email"
              className={`tx-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="promoter@zenith.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <span className="tx-error-text">{errors.email}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="orange" type="submit">
            Ingest Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default LoanLeadAddModal;
