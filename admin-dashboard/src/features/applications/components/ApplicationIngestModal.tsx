import React from 'react';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';

interface ApplicationIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    service: string;
    domain: string;
    amount: string;
    priority: string;
    assignedExecutive: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
}

export function ApplicationIngestModal({
  isOpen,
  onClose,
  form,
  setForm,
  errors,
  onSubmit
}: ApplicationIngestModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ingest New Application Case"
    >
      <form onSubmit={onSubmit} className="tx-form-container">
        <div className="tx-form-grid">
          <div className="tx-form-group">
            <label>Client / Entity Name *</label>
            <input
              type="text"
              className={`tx-input ${errors.customerName ? 'is-invalid' : ''}`}
              placeholder="e.g. Acme Tech Solutions LLP"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
            {errors.customerName && (
              <span className="tx-error-text">{errors.customerName}</span>
            )}
          </div>

          <div className="tx-form-group">
            <label>Contact Phone (10 digits) *</label>
            <input
              type="tel"
              maxLength={10}
              className={`tx-input ${errors.customerPhone ? 'is-invalid' : ''}`}
              placeholder="9876543210"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            />
            {errors.customerPhone && (
              <span className="tx-error-text">{errors.customerPhone}</span>
            )}
          </div>

          <div className="tx-form-group">
            <label>Email Address</label>
            <input
              type="email"
              className={`tx-input ${errors.customerEmail ? 'is-invalid' : ''}`}
              placeholder="contact@acme.in"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            />
            {errors.customerEmail && (
              <span className="tx-error-text">{errors.customerEmail}</span>
            )}
          </div>

          <div className="tx-form-group">
            <label>Service Type *</label>
            <select
              className="tx-input"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
            >
              <option value="GST New Registration">GST New Registration</option>
              <option value="GSTR-1 & 3B Monthly Filing">GSTR-1 & 3B Monthly Filing</option>
              <option value="Individual Income Tax (ITR 1/2)">Individual Income Tax (ITR 1/2)</option>
              <option value="Business ITR (ITR 3/4)">Business ITR (ITR 3/4)</option>
              <option value="Private Limited Company Incorporation">Private Limited Company Incorporation</option>
              <option value="MSME Business Expansion Loan">MSME Business Expansion Loan</option>
              <option value="Home Purchase & Construction Loan">Home Purchase & Construction Loan</option>
            </select>
          </div>

          <div className="tx-form-group">
            <label>Domain Division *</label>
            <select
              className="tx-input"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
            >
              <option value="CA">Chartered Accountant (CA) Domain</option>
              <option value="LOAN">Loan & Credit Appraisal Domain</option>
            </select>
          </div>

          <div className="tx-form-group">
            <label>Service Fee Amount (₹) *</label>
            <input
              type="number"
              className={`tx-input ${errors.amount ? 'is-invalid' : ''}`}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            {errors.amount && <span className="tx-error-text">{errors.amount}</span>}
          </div>

          <div className="tx-form-group">
            <label>Priority Tier *</label>
            <select
              className="tx-input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH (Urgent)</option>
              <option value="CRITICAL">CRITICAL (SLA Breach Risk)</option>
            </select>
          </div>

          <div className="tx-form-group">
            <label>Assign Primary Executive *</label>
            <select
              className="tx-input"
              value={form.assignedExecutive}
              onChange={(e) => setForm({ ...form, assignedExecutive: e.target.value })}
            >
              <option value="Suresh Kumar">Suresh Kumar (CA Senior Agent)</option>
              <option value="Priya Sharma">Priya Sharma (GST Specialist)</option>
              <option value="Rajesh Patel">Rajesh Patel (Credit Officer)</option>
              <option value="Neha Gupta">Neha Gupta (Loan Documentation)</option>
            </select>
          </div>
        </div>

        <div className="tx-form-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="orange" type="submit">
            Ingest &amp; Dispatch Application
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ApplicationIngestModal;
