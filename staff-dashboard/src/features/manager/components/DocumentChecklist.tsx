import React from 'react';
import { DOCUMENT_STATUS } from '../../../core/constants/statusEnums';
import './DocumentChecklist.css';

export interface DocumentChecklistProps {
  documents?: any[];
  onStatusChange: (docId: string, status: string) => void;
}

export default function DocumentChecklist({ documents = [], onStatusChange }: DocumentChecklistProps) {
  const getDocClass = (status: string) => {
    if (status === DOCUMENT_STATUS.VERIFIED) return 'verified';
    if (status === DOCUMENT_STATUS.REJECTED) return 'rejected';
    return 'review';
  };

  return (
    <div className="tx-doc-checklist">
      {documents.map((doc) => (
        <div key={doc.id} className={`tx-doc-item ${getDocClass(doc.status)}`}>
          <div className="tx-doc-info">
            <span className="tx-doc-title">{doc.name}</span>
            <span className="tx-doc-remarks">
              Status: <strong>{doc.status}</strong> — {doc.remarks}
            </span>
          </div>

          <div className="tx-doc-actions">
            <select
              className="tx-doc-select"
              value={doc.status}
              onChange={(e) => onStatusChange(doc.id, e.target.value)}
            >
              <option value={DOCUMENT_STATUS.UPLOADED}>{DOCUMENT_STATUS.UPLOADED}</option>
              <option value={DOCUMENT_STATUS.UNDER_REVIEW}>{DOCUMENT_STATUS.UNDER_REVIEW}</option>
              <option value={DOCUMENT_STATUS.VERIFIED}>{DOCUMENT_STATUS.VERIFIED}</option>
              <option value={DOCUMENT_STATUS.REJECTED}>{DOCUMENT_STATUS.REJECTED}</option>
              <option value={DOCUMENT_STATUS.ADDITIONAL_REQUIRED}>
                {DOCUMENT_STATUS.ADDITIONAL_REQUIRED}
              </option>
              <option value={DOCUMENT_STATUS.REUPLOAD_REQUIRED}>
                {DOCUMENT_STATUS.REUPLOAD_REQUIRED}
              </option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
