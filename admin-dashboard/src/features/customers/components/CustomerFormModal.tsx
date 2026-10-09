import React from 'react';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  title: string;
  form: {
    name: string;
    businessName: string;
    email: string;
    phone: string;
    pan: string;
    gstin: string;
    kycStatus: string;
    assignedManagerId: string;
    assignedManagerName: string;
    domain: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
}

export function CustomerFormModal({
  isOpen,
  onClose,
  isEdit = false,
  title,
  form,
  setForm,
  errors,
  onSubmit
}: CustomerFormModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="tx-modal-form">
        <div className="tx-form-grid">
          <div className="tx-form-group">
            <label>Business / Entity Legal Name *</label>
            <input
              type="text"
              className={`tx-input ${errors.businessName ? 'is-invalid' : ''}`}
              placeholder="e.g. Apex Engineering Pvt Ltd"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            />
            {errors.businessName && <span className="tx-error-text">{errors.businessName}</span>}
          </div>

          <div className="tx-form-group">
            <label>Authorized Director / Contact Person *</label>
            <input
              type="text"
              className={`tx-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Vikram Malhotra"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <span className="tx-error-text">{errors.name}</span>}
          </div>

          <div className="tx-form-group">
            <label>PAN Card Number (10 chars) *</label>
            <input
              type="text"
              maxLength={10}
              className={`tx-input ${errors.pan ? 'is-invalid' : ''}`}
              placeholder="e.g. ABCDE1234F"
              value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
            />
            {errors.pan && <span className="tx-error-text">{errors.pan}</span>}
          </div>

          <div className="tx-form-group">
            <label>GSTIN (15 characters)</label>
            <input
              type="text"
              maxLength={15}
              className={`tx-input ${errors.gstin ? 'is-invalid' : ''}`}
              placeholder="e.g. 27ABCDE1234F1Z5"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
            />
            {errors.gstin && <span className="tx-error-text">{errors.gstin}</span>}
          </div>

          <div className="tx-form-group">
            <label>Email Address *</label>
            <input
              type="email"
              className={`tx-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="director@apexeng.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <span className="tx-error-text">{errors.email}</span>}
          </div>

          <div className="tx-form-group">
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

          <div className="tx-form-group">
            <label>KYC Verification Status *</label>
            <select
              className="tx-input"
              value={form.kycStatus}
              onChange={(e) => setForm({ ...form, kycStatus: e.target.value })}
            >
              <option value="VERIFIED">VERIFIED (Documentation Complete)</option>
              <option value="PENDING">PENDING (Documents Awaited)</option>
            </select>
          </div>

          <div className="tx-form-group">
            <label>Assigned Compliance Manager &amp; Division *</label>
            <select
              className="tx-input"
              value={form.assignedManagerId}
              onChange={(e) => {
                const mgrId = e.target.value;
                const isLoan = mgrId === 'MGR002';
                setForm({
                  ...form,
                  assignedManagerId: mgrId,
                  assignedManagerName: isLoan ? 'Ananya Deshmukh (Loans & Advisory)' : 'Sanjay Verma (CA Operations)',
                  domain: isLoan ? 'LOAN' : 'CA'
                });
              }}
            >
              <option value="MGR001">Sanjay Verma (CA Operations / Direct Tax &amp; GST)</option>
              <option value="MGR002">Ananya Deshmukh (Loans &amp; Corporate Advisory)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="orange" type="submit">
            {isEdit ? 'Save Changes' : 'Register Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CustomerFormModal;
