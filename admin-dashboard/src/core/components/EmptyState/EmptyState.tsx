import React from 'react';
import { FolderSearch } from 'lucide-react';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: any;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'There is currently no data to display for this view.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="tx-empty-state">
      <div className="tx-empty-state-icon-wrap">
        <Icon size={32} className="tx-empty-state-icon" />
      </div>
      <h3 className="tx-empty-state-title">{title}</h3>
      <p className="tx-empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="tx-empty-state-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
