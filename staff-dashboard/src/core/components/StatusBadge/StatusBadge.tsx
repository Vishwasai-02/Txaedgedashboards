import React from 'react';
import './StatusBadge.css';

export default function StatusBadge({ status = 'PENDING', size = 'md' }) {
  const norm = (status || '').toUpperCase().replace(/\s+/g, '_');

  const getLabel = () => {
    switch (norm) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'APPROVED':
      case 'ACTIVE':
      case 'DISBURSED':
      case 'PAID':
        return { label: norm.replace('_', ' '), type: 'success' };
      case 'IN_PROGRESS':
      case 'PROCESSING':
      case 'ASSIGNED':
      case 'UNDER_REVIEW':
      case 'ELIGIBILITY_PASSED':
      case 'SANCTIONED':
        return { label: norm.replace('_', ' '), type: 'info' };
      case 'PENDING':
      case 'PENDING_REVIEW':
      case 'PAYMENT_PENDING':
      case 'KYC_PENDING':
      case 'DOCUMENTS_PENDING':
      case 'PARTIAL':
        return { label: norm.replace('_', ' '), type: 'warning' };
      case 'REJECTED':
      case 'REWORK_REQUIRED':
      case 'OVERDUE':
      case 'ESCALATED':
      case 'FAILED':
        return { label: norm.replace('_', ' '), type: 'error' };
      case 'CLOSED':
      case 'IDLE':
      case 'ON_HOLD':
      default:
        return { label: norm.replace('_', ' '), type: 'neutral' };
    }
  };

  const { label, type } = getLabel();

  return (
    <span className={`tx-status-pill tx-status-${type} tx-status-size-${size}`}>
      <span className="tx-status-dot" />
      {label}
    </span>
  );
}
