import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Trash2, Eye, AlertCircle } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import './AgentDocumentsPage.css';

const INITIAL_UPLOADED = [
  { id: 'UPL-01', name: 'Apex_GST_Registration_Certificate.pdf', size: '2.4 MB', type: 'PDF Document', uploadedAt: 'Today, 10:15 AM', status: 'COMPLETED' },
  { id: 'UPL-02', name: 'Greenleaf_Audit_Report_FY26.pdf', size: '4.8 MB', type: 'Audited Statement', uploadedAt: 'Yesterday, 3:45 PM', status: 'COMPLETED' },
  { id: 'UPL-03', name: 'Deshmukh_SalarySlip_August.pdf', size: '1.2 MB', type: 'Income Proof', uploadedAt: '28 Sep 2026', status: 'COMPLETED' },
];

export default function AgentDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>(INITIAL_UPLOADED);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [toast, setToast] = useState('');

  // Inspect modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; doc: any }>({
    isOpen: false,
    doc: null
  });

  const simulateUpload = (fileName: string) => {
    setCurrentFileName(fileName);
    setIsUploading(true);
    setUploadProgress(15);
    setUploadError('');

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc = {
              id: `UPL-${String(documents.length + 1).padStart(2, '0')}`,
              name: fileName,
              size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
              type: fileName.endsWith('.pdf') ? 'PDF Document' : 'Image Scan',
              uploadedAt: 'Just now',
              status: 'COMPLETED'
            };
            setDocuments([newDoc, ...documents]);
            setIsUploading(false);
            setUploadProgress(0);
            setToast(`Document "${fileName}" encrypted, scanned, and uploaded successfully.`);
            setTimeout(() => setToast(''), 4000);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const validateAndUpload = (file: File) => {
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      setUploadError('Invalid file format. Please upload PDF, JPG, or PNG.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds the 25MB ceiling.');
      return;
    }
    simulateUpload(file.name);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const promptDelete = (doc: any) => {
    setDeleteModal({
      isOpen: true,
      doc
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.doc) return;
    const docId = deleteModal.doc.id;
    const docName = deleteModal.doc.name;
    setDocuments(documents.filter((d: any) => d.id !== docId));
    setDeleteModal({ isOpen: false, doc: null });
    setToast(`Document "${docName}" removed from the repository.`);
    setTimeout(() => setToast(''), 3500);
  };

  const handleOpenInspect = (doc: any) => {
    setSelectedDoc(doc);
    setInspectModalOpen(true);
  };

  return (
    <div className="tx-agent-docs-page">
      <PageHeader
        title="Document Ingestion & Secure Upload Hub"
        subtitle="Upload client statutory filings, verification proofs, rent agreements, and government certificates"
        breadcrumb={['Executive Operations', 'Documents', 'Upload']}
      />

      {toast && (
        <div className="tx-upload-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="tx-upload-layout">
        {/* Upload Dropzone */}
        <div className="tx-dropzone-card">
          <div
            className={`tx-dropzone-box ${isDragging ? 'is-dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud size={48} className="tx-dropzone-icon" />
            <h3 className="tx-dropzone-title">Upload Client Compliance Documents</h3>
            <p className="tx-dropzone-sub">
              Drag and drop files here, or browse from local filesystem (PDF, JPG, PNG up to 25MB)
            </p>

            {uploadError && (
              <div className="tx-upload-err-banner">
                <AlertCircle size={14} />
                <span>{uploadError}</span>
              </div>
            )}

            <label className="tx-file-input-label">
              <span>Select File from Device</span>
              <input
                type="file"
                className="tx-hidden-file-input"
                onChange={handleFileSelect}
                disabled={isUploading}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </label>

            <div className="tx-preset-links">
              <span className="tx-preset-lbl">Or simulate uploading required document:</span>
              <div className="tx-preset-btns">
                <button
                  type="button"
                  className="tx-btn-preset"
                  onClick={() => simulateUpload('PAN_Card_Verification_Doc.pdf')}
                  disabled={isUploading}
                >
                  + PAN Card Copy
                </button>
                <button
                  type="button"
                  className="tx-btn-preset"
                  onClick={() => simulateUpload('Electricity_Bill_Latest.pdf')}
                  disabled={isUploading}
                >
                  + Electricity Bill
                </button>
                <button
                  type="button"
                  className="tx-btn-preset"
                  onClick={() => simulateUpload('Cancelled_Cheque_HDFC.jpg')}
                  disabled={isUploading}
                >
                  + Bank Cheque
                </button>
              </div>
            </div>

            {isUploading && (
              <div className="tx-upload-progress-box">
                <div className="tx-progress-meta">
                  <span className="tx-progress-fname">Uploading {currentFileName}...</span>
                  <span className="tx-progress-pct">{uploadProgress}%</span>
                </div>
                <div className="tx-progress-track">
                  <div
                    className="tx-progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div className="tx-uploaded-card">
          <div className="tx-uploaded-header">
            <h3 className="tx-uploaded-title">Uploaded Document Repository ({documents.length})</h3>
            <span className="tx-storage-tag">Cloud AES-256 Encrypted</span>
          </div>

          <div className="tx-uploaded-list">
            {documents.map((doc: any) => (
              <div key={doc.id} className="tx-uploaded-row">
                <div className="tx-doc-row-left">
                  <div className="tx-uploaded-icon">
                    <FileText size={18} />
                  </div>
                  <div className="tx-uploaded-details">
                    <span className="tx-doc-title-text">{doc.name}</span>
                    <span className="tx-doc-sub-text">
                      {doc.size} • {doc.type} • Uploaded {doc.uploadedAt}
                    </span>
                  </div>
                </div>

                <div className="tx-doc-row-right">
                  <StatusBadge status={doc.status} />
                  <button
                    type="button"
                    className="tx-btn-inspect-small"
                    onClick={() => handleOpenInspect(doc)}
                    title="View Document Details"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    className="tx-btn-delete-doc"
                    onClick={() => promptDelete(doc)}
                    title="Remove Document"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedDoc && (
        <Modal
          isOpen={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          title={`Document Dossier — ${selectedDoc.name}`}
        >
          <div className="tx-doc-inspect-body">
            <div className="tx-doc-inspect-card">
              <div className="tx-doc-inspect-banner">
                <FileText size={28} className="tx-doc-big-icon" />
                <div>
                  <strong>{selectedDoc.name}</strong>
                  <p>{selectedDoc.type} • {selectedDoc.size} • Upload Reference: {selectedDoc.id}</p>
                </div>
              </div>
              <div className="tx-doc-inspect-details">
                <div className="tx-inspect-item">
                  <span>Audit Timestamp:</span>
                  <strong>{selectedDoc.uploadedAt}</strong>
                </div>
                <div className="tx-inspect-item">
                  <span>Cryptographic Checksum:</span>
                  <code>SHA256: 9b2d8e4f5a1c3e7b8d0e...</code>
                </div>
                <div className="tx-inspect-item">
                  <span>Security &amp; Storage:</span>
                  <strong>AES-256 Encrypted Cold Storage</strong>
                </div>
                <div className="tx-inspect-item">
                  <span>Validation Status:</span>
                  <strong className="tx-text-green">✓ Virus &amp; OCR Verification Cleared</strong>
                </div>
              </div>
            </div>

            <div className="tx-doc-inspect-actions">
              <button
                type="button"
                className="tx-btn-modal-close"
                onClick={() => setInspectModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.doc && (
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, doc: null })}
          onConfirm={handleConfirmDelete}
          title="Remove Document from Case Dossier"
          message={`Are you sure you want to permanently delete "${deleteModal.doc.name}" (${deleteModal.doc.id})? This action will remove the attachment from the active filing.`}
          confirmText="Delete Document"
          variant="danger"
        />
      )}
    </div>
  );
}
