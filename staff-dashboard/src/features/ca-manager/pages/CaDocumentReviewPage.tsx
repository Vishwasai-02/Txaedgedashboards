import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  Check,
  X
} from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import { caManagerApi } from '../services/caManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import CaDocumentPreviewArea from '../components/CaDocumentPreviewArea';
import CaCorrectionModal from '../components/CaCorrectionModal';
import './CaDocumentReviewPage.css';

const PRESET_DEFICIENCIES = [
  'Missing Authorized Signatory signature on declaration sheet.',
  'Utility bill is older than 2 months; latest August/September bill required.',
  'GSTR-2B vs Books ITC reconciliation has unreconciled difference.',
  'ICAI UDIN verification missing on Statutory Audit Report.',
  'Document scan is blurry or illegible; request high-resolution copy.'
];

export default function CaDocumentReviewPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionRemarks, setCorrectionRemarks] = useState('');
  const [remarksError, setRemarksError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Document preview controls & settings
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Approval confirmation modal
  const [approveConfirm, setApproveConfirm] = useState(false);

  const loadCases = async () => {
    const data = await caManagerApi.getDocumentReviewCases();
    setCases(data);
    if (data.length > 0) {
      setSelectedCase((prev: any) => (prev ? (data.find((c: any) => c.id === prev.id) || data[0]) : data[0]));
      if (data[0].documents && data[0].documents.length > 0) {
        setActiveDoc((prev: any) => (prev ? (data[0].documents.find((d: any) => d.id === prev.id) || data[0].documents[0]) : data[0].documents[0]));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCases();
    const unsubRev = caManagerApi.subscribe(STORAGE_KEYS.REVIEW_CASES, () => loadCases());
    const unsubTasks = caManagerApi.subscribe(STORAGE_KEYS.TASKS, () => loadCases());
    return () => {
      if (unsubRev) unsubRev();
      if (unsubTasks) unsubTasks();
    };
  }, []);

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSelectCase = (c: any) => {
    setSelectedCase(c);
    if (c.documents && c.documents.length > 0) {
      setActiveDoc(c.documents[0]);
    } else {
      setActiveDoc(null);
    }
    setZoomLevel(100);
    setRotation(0);
  };

  const handleToggleDocVerification = (docId: string) => {
    if (!selectedCase) return;
    const updatedDocs = selectedCase.documents.map((d: any) =>
      d.id === docId ? { ...d, verified: !d.verified } : d
    );
    const updatedCase = { ...selectedCase, documents: updatedDocs };
    setSelectedCase(updatedCase);
    setCases(cases.map((c: any) => (c.id === updatedCase.id ? updatedCase : c)));
    if (activeDoc && activeDoc.id === docId) {
      setActiveDoc({ ...activeDoc, verified: !activeDoc.verified });
    }
    showToast(`Verification status updated for "${activeDoc?.name || 'document'}".`, 'info');
  };

  const handleApproveCase = async () => {
    if (!selectedCase) return;
    await caManagerApi.approveCase(selectedCase.id);
    await loadCases();
    setApproveConfirm(false);
    showToast(`All documents for ${selectedCase.client} verified & approved! Filing signed off.`, 'success');
  };

  const handleRequestCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionRemarks.trim() || correctionRemarks.trim().length < 10) {
      setRemarksError('Audit remarks are required (minimum 10 characters).');
      return;
    }

    if (!selectedCase) return;
    await caManagerApi.requestCorrection(selectedCase.id, correctionRemarks.trim());
    await loadCases();
    setCorrectionModalOpen(false);
    setCorrectionRemarks('');
    setRemarksError('');
    showToast(
      `Correction request dispatched to ${selectedCase.assignedAgent} for ${selectedCase.client}. Case returned for rework.`,
      'warning'
    );
  };

  const handleDownloadDoc = () => {
    if (!activeDoc) return;
    showToast(`Downloading "${activeDoc.file}" (${activeDoc.name})...`, 'info');
  };

  const handleResetView = () => {
    setZoomLevel(100);
    setRotation(0);
    showToast('Preview view settings reset to default (100%, 0°).', 'info');
  };

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.client.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.service.toLowerCase().includes(q) ||
      (c.assignedAgent && c.assignedAgent.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = cases.filter((c) => c.status === 'PENDING_REVIEW').length;
  const reworkCount = cases.filter((c) => c.status === 'REWORK_REQUIRED').length;
  const approvedCount = cases.filter((c) => c.status === 'APPROVED').length;

  if (loading || !selectedCase) {
    return <div className="tx-loading-state">Loading document audit workspace...</div>;
  }

  const verifiedDocsCount = selectedCase.documents?.filter((d: any) => d.verified).length || 0;
  const totalDocsCount = selectedCase.documents?.length || 0;

  return (
    <div className="tx-ca-docs-page">
      {feedback && (
        <div className={`tx-ca-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <PageHeader
        title="Document Audit & Verification Workspace"
        subtitle="Verify client KYC, financial statements, and rent agreements before return submission"
        breadcrumb={['CA Domain', 'Audit', 'Document Review']}
        badge={
          <div className="tx-header-status-badge">
            <StatusBadge status={selectedCase.status} />
          </div>
        }
        actions={
          <div className="tx-review-actions">
            <button
              type="button"
              className="tx-btn-correction"
              onClick={() => {
                setRemarksError('');
                setCorrectionModalOpen(true);
              }}
              title="Return case to agent for resubmission"
            >
              <AlertTriangle size={15} />
              <span>Request Correction</span>
            </button>
            <button
              type="button"
              className="tx-btn-approve-all"
              onClick={() => setApproveConfirm(true)}
              title="Clear all documents and sign off return"
            >
              <CheckCircle2 size={15} />
              <span>Approve All Documents</span>
            </button>
          </div>
        }
      />

      <div className="tx-doc-review-layout">
        <div className="tx-cases-sidebar">
          <div className="tx-sidebar-header-row">
            <div>
              <h3 className="tx-sidebar-heading">Document Audit Queue</h3>
              <p className="tx-sidebar-subheading">{cases.length} total filings awaiting audit</p>
            </div>
          </div>

          <div className="tx-doc-search-box">
            <Search size={14} className="tx-search-icon" />
            <input
              type="text"
              placeholder="Search by client, ID, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="tx-clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="tx-status-filter-pills">
            <button
              type="button"
              className={`tx-filter-pill-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({cases.length})
            </button>
            <button
              type="button"
              className={`tx-filter-pill-btn ${statusFilter === 'PENDING_REVIEW' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING_REVIEW')}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`tx-filter-pill-btn ${statusFilter === 'REWORK_REQUIRED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('REWORK_REQUIRED')}
            >
              Rework ({reworkCount})
            </button>
            <button
              type="button"
              className={`tx-filter-pill-btn ${statusFilter === 'APPROVED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('APPROVED')}
            >
              Approved ({approvedCount})
            </button>
          </div>

          <div className="tx-cases-list">
            {filteredCases.length === 0 ? (
              <div className="tx-cases-empty">
                <p>No audit cases match your filter criteria.</p>
                {(searchQuery || statusFilter !== 'ALL') && (
                  <button
                    type="button"
                    className="tx-btn-reset-filters"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = selectedCase.id === c.id;
                const vCount = c.documents?.filter((d: any) => d.verified).length || 0;
                const tCount = c.documents?.length || 0;
                return (
                  <div
                    key={c.id}
                    className={`tx-case-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectCase(c)}
                  >
                    <div className="tx-case-item-top">
                      <span className="tx-case-id">{c.id}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <h4 className="tx-case-client">{c.client}</h4>
                    <span className="tx-case-service">{c.service}</span>
                    <div className="tx-case-meta">
                      <span className="tx-case-agent">Agent: {c.assignedAgent}</span>
                      <span className={`tx-doc-count-badge ${vCount === tCount ? 'complete' : ''}`}>
                        {vCount}/{tCount} Docs Verified
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="tx-doc-viewer-panel">
          <div className="tx-doc-tabs-bar">
            <div className="tx-doc-tabs-list">
              {selectedCase.documents?.map((doc: any) => {
                const isDocActive = activeDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    className={`tx-doc-tab ${isDocActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveDoc(doc);
                      setZoomLevel(100);
                      setRotation(0);
                    }}
                  >
                    <FileText size={14} className="tx-tab-file-icon" />
                    <span className="tx-tab-doc-name">{doc.name}</span>
                    {doc.verified ? (
                      <span title="Verified"><CheckCircle2 size={13} className="tx-tab-icon-verified" /></span>
                    ) : (
                      <span title="Pending Verification"><AlertTriangle size={13} className="tx-tab-icon-pending" /></span>
                    )}
                  </button>
                );
              })}
            </div>

            {activeDoc && (
              <button
                type="button"
                className={`tx-btn-verify-doc ${activeDoc.verified ? 'verified' : 'unverified'}`}
                onClick={() => handleToggleDocVerification(activeDoc.id)}
                title={activeDoc.verified ? 'Click to mark unverified' : 'Click to mark verified'}
              >
                {activeDoc.verified ? (
                  <>
                    <Check size={13} />
                    <span>Document Verified</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Verify Document</span>
                  </>
                )}
              </button>
            )}
          </div>

          <CaDocumentPreviewArea
            activeDoc={activeDoc}
            selectedCase={selectedCase}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            rotation={rotation}
            setRotation={setRotation}
            handleResetView={handleResetView}
            handleDownloadDoc={handleDownloadDoc}
            handleToggleDocVerification={handleToggleDocVerification}
            verifiedDocsCount={verifiedDocsCount}
            totalDocsCount={totalDocsCount}
          />
        </div>
      </div>

      <CaCorrectionModal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        selectedCase={selectedCase}
        presetDeficiencies={PRESET_DEFICIENCIES}
        correctionRemarks={correctionRemarks}
        setCorrectionRemarks={setCorrectionRemarks}
        remarksError={remarksError}
        setRemarksError={setRemarksError}
        onSubmit={handleRequestCorrection}
      />

      <ConfirmationModal
        isOpen={approveConfirm}
        onClose={() => setApproveConfirm(false)}
        onConfirm={handleApproveCase}
        title="Approve All Documents"
        message={`Confirm complete audit clearance for all ${selectedCase.documents?.length || 0} documents under ${selectedCase.client}? This will mark the review case APPROVED and transition the service filing to COMPLETED.`}
        variant="primary"
        confirmText="Confirm Clearance & Sign Off"
      />
    </div>
  );
}
