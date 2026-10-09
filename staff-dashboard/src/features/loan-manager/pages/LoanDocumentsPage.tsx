import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Download,
  ShieldCheck,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Send,
  CheckCheck
} from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import './LoanDocumentsPage.css';

const INITIAL_LOAN_DOCS = [
  { id: 'LDOC-01', borrower: 'Apex Infra Projects LLP', document: '6 Months Operative Current Bank Statement', file: 'hdfc_current_apr_sep26.pdf', size: '4.8 MB', category: 'Banking', verified: true, remarks: 'Average monthly balance ₹18.4L confirmed.' },
  { id: 'LDOC-02', borrower: 'Apex Infra Projects LLP', document: 'Audited Financials & Form 3CB-3CD (2 Years)', file: 'audited_pnl_balance_sheet.pdf', size: '8.2 MB', category: 'Financials', verified: true, remarks: 'PAT positive for FY25 and FY26.' },
  { id: 'LDOC-03', borrower: 'Apex Infra Projects LLP', document: 'GST Returns (GSTR-3B last 12 months)', file: 'gst_returns_consolidated.pdf', size: '6.1 MB', category: 'Tax Compliance', verified: false, remarks: 'August 2026 return reconciliation pending.' },
  { id: 'LDOC-04', borrower: 'Sanjay Deshmukh', document: 'Salary Slips (Last 3 Months)', file: 'salary_slips_jul_sep26.pdf', size: '1.4 MB', category: 'Income Proof', verified: true, remarks: 'Net monthly credited ₹1,42,000.' },
  { id: 'LDOC-05', borrower: 'Sanjay Deshmukh', document: 'Property Title Deed & NOC from Builder', file: 'registry_title_deed_flat502.pdf', size: '12.5 MB', category: 'Collateral', verified: true, remarks: 'Search report clean with zero encumbrance.' },
  { id: 'LDOC-06', borrower: 'Nexus Retail Solutions', document: 'Machinery Proforma Quotation & Invoice', file: 'cnc_machine_quotation.pdf', size: '2.1 MB', category: 'Asset Proof', verified: false, remarks: 'Supplier GSTIN validation in progress.' },
];

export default function LoanDocumentsPage() {
  const [docs, setDocs] = useState(INITIAL_LOAN_DOCS);
  const [filter, setFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  // Inspection modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Correction request modal
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<any>(null);
  const [correctionRemarks, setCorrectionRemarks] = useState('');
  const [correctionDate, setCorrectionDate] = useState('2026-10-10');
  const [correctionError, setCorrectionError] = useState('');

  // Bulk confirmation modal
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const toggleVerify = (id: string) => {
    setDocs(
      docs.map((d) => (d.id === id ? { ...d, verified: !d.verified } : d))
    );
    setToast('Document verification status updated.');
    setTimeout(() => setToast(''), 3000);
  };

  const openInspectModal = (doc: any) => {
    setActiveDoc(doc);
    setZoomLevel(100);
    setRotation(0);
    setInspectModalOpen(true);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(50, Math.min(200, prev + delta)));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const openCorrectionModal = (doc: any) => {
    setCorrectionTarget(doc);
    setCorrectionRemarks(doc.remarks || '');
    setCorrectionError('');
    setCorrectionModalOpen(true);
  };

  const submitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget) return;
    if (!correctionRemarks.trim() || correctionRemarks.trim().length < 10) {
      setCorrectionError('Mandatory requirement: Deficiency explanation must be at least 10 characters.');
      return;
    }

    setDocs(
      docs.map((d) =>
        d.id === correctionTarget.id
          ? { ...d, verified: false, remarks: `Correction Requested: ${correctionRemarks.trim()}` }
          : d
      )
    );
    setCorrectionModalOpen(false);
    if (inspectModalOpen) setInspectModalOpen(false);
    setToast(`Correction request dispatched for ${correctionTarget.document} to borrower portal.`);
    setTimeout(() => setToast(''), 4500);
  };

  const handleBulkApprove = () => {
    setDocs(docs.map((d) => ({ ...d, verified: true })));
    setBulkConfirmOpen(false);
    setToast('All compliance and credit documents verified and cleared.');
    setTimeout(() => setToast(''), 4000);
  };

  const verifiedCount = docs.filter((d) => d.verified).length;
  const clearancePct = Math.round((verifiedCount / docs.length) * 100);

  const filteredDocs = docs.filter((d) => {
    if (filter === 'VERIFIED' && !d.verified) return false;
    if (filter === 'PENDING' && d.verified) return false;
    if (categoryFilter !== 'ALL' && d.category !== categoryFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSearch =
        (d.borrower?.toLowerCase() || '').includes(q) ||
        (d.id?.toLowerCase() || '').includes(q) ||
        (d.document?.toLowerCase() || '').includes(q) ||
        (d.category?.toLowerCase() || '').includes(q);
      if (!matchSearch) return false;
    }
    return true;
  });

  return (
    <div className="tx-loan-docs-page">
      <PageHeader
        title="Credit Document Due Diligence & Audit"
        subtitle="Verify borrower income proofs, statutory tax filings, bank transaction statements, and collateral title records"
        breadcrumb={['Loan Domain', 'Appraisal', 'Documents']}
      />

      {toast && (
        <div className="tx-docs-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Progress & Clearance Summary */}
      <div className="tx-docs-progress-card">
        <div className="tx-dp-left">
          <span className="tx-dp-title">Portfolio Audit Clearance Progress</span>
          <span className="tx-dp-sub">
            {verifiedCount} of {docs.length} Documents Cleared ({clearancePct}%)
          </span>
          <div className="tx-dp-bar-bg">
            <div className="tx-dp-bar-fill" style={{ width: `${clearancePct}%` }} />
          </div>
        </div>

        <div className="tx-dp-right">
          <button
            type="button"
            className="tx-btn-bulk-approve"
            onClick={() => setBulkConfirmOpen(true)}
            disabled={clearancePct === 100}
          >
            <CheckCheck size={16} />
            <span>Approve All Documents</span>
          </button>
        </div>
      </div>

      <div className="tx-docs-controls-bar">
        <div className="tx-docs-search-box">
          <Search size={16} className="tx-search-icon" />
          <input
            type="text"
            placeholder="Search by Document, Borrower, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="tx-search-clear-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="tx-docs-pills">
          <button
            type="button"
            className={`tx-doc-pill ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All ({docs.length})
          </button>
          <button
            type="button"
            className={`tx-doc-pill ${filter === 'VERIFIED' ? 'active' : ''}`}
            onClick={() => setFilter('VERIFIED')}
          >
            Verified ({verifiedCount})
          </button>
          <button
            type="button"
            className={`tx-doc-pill ${filter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            Pending ({docs.length - verifiedCount})
          </button>
        </div>

        <div className="tx-category-select-wrap">
          <select
            className="tx-cat-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Banking">Banking</option>
            <option value="Financials">Financials</option>
            <option value="Tax Compliance">Tax Compliance</option>
            <option value="Income Proof">Income Proof</option>
            <option value="Collateral">Collateral</option>
            <option value="Asset Proof">Asset Proof</option>
          </select>
        </div>
      </div>

      <div className="tx-docs-table-card">
        <div className="tx-table-container">
          <table className="tx-docs-table">
            <thead>
              <tr>
                <th>Doc ID</th>
                <th>Borrower Entity</th>
                <th>Document Required</th>
                <th>Category</th>
                <th>File Reference</th>
                <th>Verification Findings</th>
                <th>Audit Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <span className="tx-doc-id-pill">{doc.id}</span>
                  </td>
                  <td>
                    <strong>{doc.borrower}</strong>
                  </td>
                  <td>
                    <span className="tx-doc-name">{doc.document}</span>
                  </td>
                  <td>
                    <span className="tx-doc-cat-tag">{doc.category}</span>
                  </td>
                  <td>
                    <span className="tx-doc-filename">{doc.file} ({doc.size})</span>
                  </td>
                  <td>
                    <span className="tx-doc-remarks">{doc.remarks}</span>
                  </td>
                  <td>
                    <span className={`tx-verify-pill ${doc.verified ? 'verified' : 'pending'}`}>
                      {doc.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="tx-row-actions">
                      <button
                        type="button"
                        className="tx-btn-inspect-doc"
                        onClick={() => openInspectModal(doc)}
                        title="Inspect Document"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                      <button
                        type="button"
                        className={`tx-btn-toggle-verify ${doc.verified ? 'is-verified' : 'is-pending'}`}
                        onClick={() => toggleVerify(doc.id)}
                      >
                        {doc.verified ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        <span>{doc.verified ? 'Approved' : 'Verify'}</span>
                      </button>
                      {!doc.verified && (
                        <button
                          type="button"
                          className="tx-btn-request-correction"
                          onClick={() => openCorrectionModal(doc)}
                          title="Request Resubmission"
                        >
                          <AlertTriangle size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Inspection Modal */}
      {activeDoc && (
        <Modal
          isOpen={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          title={`Document Dossier Audit — ${activeDoc.id}`}
        >
          <div className="tx-inspect-modal-body">
            <div className="tx-inspect-header">
              <div>
                <h4 className="tx-inspect-title">{activeDoc.document}</h4>
                <p className="tx-inspect-meta">
                  Borrower: <strong>{activeDoc.borrower}</strong> • File: {activeDoc.file} ({activeDoc.size})
                </p>
              </div>
              <span className={`tx-verify-pill ${activeDoc.verified ? 'verified' : 'pending'}`}>
                {activeDoc.verified ? 'Audited & Verified' : 'Awaiting Audit'}
              </span>
            </div>

            {/* Viewer Controls */}
            <div className="tx-viewer-controls">
              <span className="tx-viewer-zoom-lbl">Zoom: {zoomLevel}%</span>
              <button type="button" className="tx-ctrl-btn" onClick={() => handleZoom(15)} title="Zoom In">
                <ZoomIn size={15} />
              </button>
              <button type="button" className="tx-ctrl-btn" onClick={() => handleZoom(-15)} title="Zoom Out">
                <ZoomOut size={15} />
              </button>
              <button type="button" className="tx-ctrl-btn" onClick={handleRotate} title="Rotate 90°">
                <RotateCw size={15} />
              </button>
            </div>

            {/* Simulated Document Canvas */}
            <div className="tx-viewer-canvas-wrap">
              <div
                className="tx-simulated-doc-page"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'top center'
                }}
              >
                <div className="tx-doc-watermark">CONFIDENTIAL DUE DILIGENCE AUDIT</div>
                <div className="tx-doc-inner-content">
                  <div className="tx-doc-header-band">
                    <strong>{activeDoc.borrower}</strong>
                    <span>Category: {activeDoc.category}</span>
                  </div>
                  <h3 className="tx-doc-heading-sim">{activeDoc.document}</h3>
                  <div className="tx-doc-grid-sim">
                    <div>
                      <span className="tx-sim-lbl">File Archive ID:</span>
                      <code>{activeDoc.id}-SECURE-HASH-2026</code>
                    </div>
                    <div>
                      <span className="tx-sim-lbl">Audit Finding:</span>
                      <p>{activeDoc.remarks}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tx-inspect-modal-footer">
              <button
                type="button"
                className="tx-btn-inspect-correct"
                onClick={() => openCorrectionModal(activeDoc)}
              >
                <AlertTriangle size={14} />
                <span>Request Resubmission</span>
              </button>
              <button
                type="button"
                className="tx-btn-inspect-verify"
                onClick={() => {
                  toggleVerify(activeDoc.id);
                  setInspectModalOpen(false);
                }}
              >
                <CheckCircle2 size={14} />
                <span>{activeDoc.verified ? 'Mark as Pending' : 'Approve & Clear Document'}</span>
              </button>
              <button
                type="button"
                className="tx-btn-inspect-close"
                onClick={() => setInspectModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Correction Request Modal */}
      {correctionTarget && (
        <Modal
          isOpen={correctionModalOpen}
          onClose={() => setCorrectionModalOpen(false)}
          title={`Flag Document Deficiency — ${correctionTarget.id}`}
        >
          <form onSubmit={submitCorrection} className="tx-correction-form">
            <p className="tx-correction-info">
              Dispatches an automated notification to <strong>{correctionTarget.borrower}</strong> via SMS &amp; Client Portal detailing the exact compliance deficiency.
            </p>

            {correctionError && (
              <div className="tx-form-error-banner">
                <AlertTriangle size={14} />
                <span>{correctionError}</span>
              </div>
            )}

            <div className="tx-form-group">
              <label>Document Subject</label>
              <input type="text" value={correctionTarget.document} disabled />
            </div>

            <div className="tx-form-group">
              <label>Reason for Deficiency / Required Rectification *</label>
              <textarea
                rows={3}
                value={correctionRemarks}
                onChange={(e) => {
                  setCorrectionRemarks(e.target.value);
                  if (correctionError) setCorrectionError('');
                }}
                placeholder="Detail the discrepancy (e.g. statement missing page 3, seal missing, figure mismatch)..."
                required
              />
            </div>

            <div className="tx-form-group">
              <label>Target Resubmission Due Date</label>
              <input
                type="date"
                value={correctionDate}
                onChange={(e) => setCorrectionDate(e.target.value)}
              />
            </div>

            <div className="tx-modal-form-actions">
              <button
                type="button"
                className="tx-btn-modal-cancel"
                onClick={() => setCorrectionModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="tx-btn-submit-correction">
                <Send size={14} />
                <span>Dispatch Deficiency Notice</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk Approval Confirmation Modal */}
      <ConfirmationModal
        isOpen={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={handleBulkApprove}
        title="Approve All Due Diligence Documents"
        message="Are you sure you want to mark all 6 credit and compliance documents as audited and verified? This will endorse full borrower documentation compliance."
        confirmText="Approve All Documents"
        variant="primary"
      />
    </div>
  );
}
