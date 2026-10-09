import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import './ConfirmationModal.css';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning' | string;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="tx-confirm-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tx-confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="tx-confirm-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="tx-confirm-modal-header">
          <div className={`tx-confirm-modal-icon tx-confirm-icon-${variant}`}>
            {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
          </div>
          <div className="tx-confirm-modal-text">
            <h3 className="tx-confirm-modal-title">{title}</h3>
            <p className="tx-confirm-modal-message">{message}</p>
          </div>
        </div>

        <div className="tx-confirm-modal-actions">
          <button
            type="button"
            className="tx-confirm-btn tx-confirm-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`tx-confirm-btn ${isDanger ? 'tx-confirm-btn-danger' : 'tx-confirm-btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
