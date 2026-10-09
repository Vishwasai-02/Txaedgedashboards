import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import Modal from '../../../core/components/Modal/Modal';
import PriorityBadge from '../../../core/components/PriorityBadge/PriorityBadge';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import { APPLICATION_STATUS } from '../../../core/constants/statusEnums';
import { ApplicationItem } from '../../../shared/types/workflowTypes';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: ApplicationItem | null;
  docChecklist: { name: string; verified: boolean; file: string }[];
  toggleDocVerify: (idx: number) => void;
  promptStatusChange: (newStatus: string) => void;
}

export function ApplicationDetailModal({
  isOpen,
  onClose,
  selectedApp,
  docChecklist,
  toggleDocVerify,
  promptStatusChange
}: ApplicationDetailModalProps) {
  if (!isOpen || !selectedApp) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Application Details — ${selectedApp.id}`}
    >
      <div className="tx-app-detail-modal-body">
        <div className="tx-app-detail-top-grid">
          <div>
            <span className="tx-muted-label">Customer / Entity</span>
            <h4 className="tx-detail-val">{selectedApp.customerName}</h4>
            <span className="tx-detail-sub">{selectedApp.customerPhone}</span>
          </div>
          <div>
            <span className="tx-muted-label">Service Rendered</span>
            <h4 className="tx-detail-val">{selectedApp.service}</h4>
            <span className="tx-detail-sub">Submitted: {selectedApp.submittedDate}</span>
          </div>
          <div>
            <span className="tx-muted-label">Priority &amp; Status</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <PriorityBadge priority={selectedApp.priority} />
              <StatusBadge status={selectedApp.status} />
            </div>
          </div>
          <div>
            <span className="tx-muted-label">Assigned Executive</span>
            <h4 className="tx-detail-val">{selectedApp.assignedExecutive}</h4>
            <span className="tx-detail-sub">Due: {selectedApp.dueDate}</span>
          </div>
        </div>

        <div className="tx-app-doc-section">
          <h4 className="tx-section-title">KYC &amp; Filing Document Checklist</h4>
          <p className="tx-section-sub">
            Audit submitted documents before statutory submission or loan sanction release:
          </p>
          <div className="tx-doc-checklist-grid">
            {docChecklist.map((doc, idx) => (
              <div
                key={doc.name}
                className={`tx-doc-checklist-item ${doc.verified ? 'verified' : 'unverified'}`}
                onClick={() => toggleDocVerify(idx)}
                role="button"
                tabIndex={0}
              >
                <div className="tx-doc-check-icon">
                  {doc.verified ? (
                    <CheckCircle2 size={18} color="#2E7D32" />
                  ) : (
                    <AlertTriangle size={18} color="#E65100" />
                  )}
                </div>
                <div className="tx-doc-info">
                  <span className="tx-doc-name">{doc.name}</span>
                  <span className="tx-doc-filename">{doc.file}</span>
                </div>
                <span className={`tx-doc-status-pill ${doc.verified ? 'verified' : 'pending'}`}>
                  {doc.verified ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="tx-app-modal-actions-bar">
          <div className="tx-status-change-label">Advance Status:</div>
          <div className="tx-status-btn-group">
            <button
              type="button"
              className="tx-btn-status-action btn-processing"
              onClick={() => promptStatusChange(APPLICATION_STATUS.PROCESSING)}
              disabled={selectedApp.status === APPLICATION_STATUS.PROCESSING}
            >
              Mark In Processing
            </button>
            <button
              type="button"
              className="tx-btn-status-action btn-docs"
              onClick={() =>
                promptStatusChange(APPLICATION_STATUS.ADDITIONAL_DOCUMENT_REQUIRED)
              }
              disabled={selectedApp.status === APPLICATION_STATUS.ADDITIONAL_DOCUMENT_REQUIRED}
            >
              Require Documents
            </button>
            <button
              type="button"
              className="tx-btn-status-action btn-complete"
              onClick={() => promptStatusChange(APPLICATION_STATUS.COMPLETED)}
              disabled={selectedApp.status === APPLICATION_STATUS.COMPLETED}
            >
              Mark Completed
            </button>
            <button
              type="button"
              className="tx-btn-status-action btn-reject"
              onClick={() => promptStatusChange(APPLICATION_STATUS.REJECTED)}
              disabled={selectedApp.status === APPLICATION_STATUS.REJECTED}
            >
              Reject Application
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ApplicationDetailModal;
