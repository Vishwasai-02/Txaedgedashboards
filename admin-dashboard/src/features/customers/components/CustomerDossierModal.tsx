import React from 'react';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';
import { Customer } from '../../../shared/types/workflowTypes';

interface CustomerDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomer: Customer | null;
  onOpenEdit: (customer: Customer) => void;
}

export function CustomerDossierModal({
  isOpen,
  onClose,
  selectedCustomer,
  onOpenEdit
}: CustomerDossierModalProps) {
  if (!isOpen || !selectedCustomer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Client KYC Dossier — ${selectedCustomer.businessName}`}
    >
      <div className="tx-customer-dossier">
        <div className="tx-dossier-header-card">
          <div>
            <span className="tx-dossier-id-badge">{selectedCustomer.id}</span>
            <h3 className="tx-dossier-title">{selectedCustomer.businessName}</h3>
            <p className="tx-dossier-director">Director: {selectedCustomer.name}</p>
          </div>
          <span className={`tx-kyc-badge ${selectedCustomer.kycStatus === 'VERIFIED' ? 'verified' : 'pending'}`}>
            KYC: {selectedCustomer.kycStatus}
          </span>
        </div>

        <div className="tx-dossier-grid">
          <div className="tx-dossier-field">
            <span className="tx-field-label">Assigned Compliance Manager</span>
            <span className="tx-field-value" style={{ fontWeight: 600, color: '#083B75' }}>
              {selectedCustomer.assignedManagerName || (selectedCustomer.domain === 'LOAN' ? 'Ananya Deshmukh (Loan Advisory)' : 'Sanjay Verma (CA Operations)')}
            </span>
          </div>
          <div className="tx-dossier-field">
            <span className="tx-field-label">Permanent Account Number (PAN)</span>
            <span className="tx-field-value">{selectedCustomer.pan}</span>
          </div>
          <div className="tx-dossier-field">
            <span className="tx-field-label">GST Identification Number</span>
            <span className="tx-field-value">{selectedCustomer.gstin}</span>
          </div>
          <div className="tx-dossier-field">
            <span className="tx-field-label">Primary Contact Email</span>
            <span className="tx-field-value">{selectedCustomer.email}</span>
          </div>
          <div className="tx-dossier-field">
            <span className="tx-field-label">Verified Mobile Number</span>
            <span className="tx-field-value">{selectedCustomer.phone}</span>
          </div>
          <div className="tx-dossier-field">
            <span className="tx-field-label">Total Completed Filings</span>
            <span className="tx-field-value">{selectedCustomer.totalApplications} Cases</span>
          </div>
          <div className="tx-dossier-field">
            <span className="tx-field-label">Account Onboarding Date</span>
            <span className="tx-field-value">{selectedCustomer.joinedDate}</span>
          </div>
        </div>

        <div className="tx-dossier-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="secondary" onClick={onClose}>
            Close Dossier
          </Button>
          <Button
            variant="orange"
            onClick={() => {
              onClose();
              onOpenEdit(selectedCustomer);
            }}
          >
            Edit Client Data
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CustomerDossierModal;
