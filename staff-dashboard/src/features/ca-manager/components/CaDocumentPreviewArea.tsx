import React from 'react';
import {
  FileText,
  ZoomOut,
  ZoomIn,
  RotateCw,
  RotateCcw,
  Download,
  Check,
  CheckCircle2
} from 'lucide-react';

interface CaDocumentPreviewAreaProps {
  activeDoc: any;
  selectedCase: any;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  handleResetView: () => void;
  handleDownloadDoc: () => void;
  handleToggleDocVerification: (docId: string) => void;
  verifiedDocsCount: number;
  totalDocsCount: number;
}

export function CaDocumentPreviewArea({
  activeDoc,
  selectedCase,
  zoomLevel,
  setZoomLevel,
  rotation,
  setRotation,
  handleResetView,
  handleDownloadDoc,
  handleToggleDocVerification,
  verifiedDocsCount,
  totalDocsCount
}: CaDocumentPreviewAreaProps) {
  if (!activeDoc) {
    return <div className="tx-preview-empty">Select a document from above to inspect and verify.</div>;
  }

  return (
    <div className="tx-doc-preview-area">
      {/* Settings & Inspection Toolbar */}
      <div className="tx-preview-header">
        {/* File Information (Left) */}
        <div className="tx-preview-meta-left">
          <div className="tx-file-badge">
            <FileText size={14} />
            <span className="tx-preview-filename">{activeDoc.file}</span>
          </div>
          <span className="tx-preview-filesize">{activeDoc.size || '1.8 MB'}</span>
          <span className="tx-preview-type">{activeDoc.type || 'DOCUMENT'}</span>
        </div>

        {/* View Settings & Zoom Controls (Center) */}
        <div className="tx-preview-controls-bar">
          <div className="tx-zoom-control-group">
            <button
              type="button"
              className="tx-zoom-btn"
              onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span
              className="tx-zoom-level"
              onClick={() => setZoomLevel(100)}
              title="Click to reset zoom to 100%"
            >
              {zoomLevel}%
            </span>
            <button
              type="button"
              className="tx-zoom-btn"
              onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <div className="tx-control-divider" />

          <button
            type="button"
            className="tx-zoom-btn"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            title="Rotate 90° clockwise"
          >
            <RotateCw size={14} />
          </button>

          <button
            type="button"
            className="tx-zoom-btn"
            onClick={handleResetView}
            title="Reset view settings"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Audit Status & Actions (Right) */}
        <div className="tx-preview-meta-right">
          <button
            type="button"
            className="tx-btn-download-doc"
            onClick={handleDownloadDoc}
            title="Download document for offline audit"
          >
            <Download size={13} />
            <span>Download</span>
          </button>

          <span className={`tx-verify-indicator ${activeDoc.verified ? 'verified' : 'pending'}`}>
            {activeDoc.verified ? 'Verified by CA' : 'Pending Verification'}
          </span>
        </div>
      </div>

      {/* Viewport Simulation */}
      <div className="tx-preview-viewport">
        <div
          className="tx-simulated-doc"
          style={{
            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease'
          }}
        >
          <div className="tx-doc-watermark">TAXEDGE SECURE AUDIT</div>
          <div className="tx-doc-content-mock">
            <div className="tx-doc-header-mock">
              <div className="tx-doc-header-titles">
                <h4>{activeDoc.name}</h4>
                <span className="tx-doc-id-label">Record Ref: {activeDoc.id.toUpperCase()}-2026-CA</span>
              </div>
              <span className={`tx-doc-stamp ${activeDoc.verified ? 'approved' : 'pending'}`}>
                {activeDoc.verified ? 'CA VERIFIED' : 'PENDING'}
              </span>
            </div>

            <div className="tx-doc-meta-table">
              <div className="tx-doc-row">
                <span className="tx-row-label">Associated Client:</span>
                <strong className="tx-row-value">{selectedCase.client}</strong>
              </div>
              <div className="tx-doc-row">
                <span className="tx-row-label">Compliance Purpose:</span>
                <strong className="tx-row-value">{selectedCase.service}</strong>
              </div>
              <div className="tx-doc-row">
                <span className="tx-row-label">Uploaded File:</span>
                <code className="tx-row-code">{activeDoc.file}</code>
              </div>
              <div className="tx-doc-row">
                <span className="tx-row-label">Audit Status:</span>
                <strong className={`tx-row-status ${activeDoc.verified ? 'verified' : 'pending'}`}>
                  {activeDoc.verified ? 'PASSED CA VERIFICATION' : 'AWAITING INSPECTION'}
                </strong>
              </div>
              <div className="tx-doc-row">
                <span className="tx-row-label">Inspector Remarks:</span>
                <span className="tx-row-remarks">{activeDoc.remarks || 'No issues detected on this record.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Summary & Details Footer Bar */}
      <div className="tx-doc-summary-footer">
        <div className="tx-summary-col">
          <span className="tx-summary-title">Client Entity</span>
          <span className="tx-summary-detail">{selectedCase.client}</span>
        </div>
        <div className="tx-summary-col">
          <span className="tx-summary-title">Submitting Agent</span>
          <span className="tx-summary-detail">{selectedCase.assignedAgent}</span>
        </div>
        <div className="tx-summary-col">
          <span className="tx-summary-title">Case Progress</span>
          <span className="tx-summary-detail">
            {verifiedDocsCount} of {totalDocsCount} Documents Cleared
          </span>
        </div>
        <div className="tx-summary-actions">
          <button
            type="button"
            className={`tx-btn-inline-verify ${activeDoc.verified ? 'is-verified' : ''}`}
            onClick={() => handleToggleDocVerification(activeDoc.id)}
          >
            {activeDoc.verified ? 'Revoke Verification' : 'Mark Document Verified'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CaDocumentPreviewArea;
