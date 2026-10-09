import React from 'react';
import './PriorityBadge.css';

export default function PriorityBadge({ priority = 'MEDIUM' }) {
  const norm = (priority || '').toUpperCase();

  const getPriorityClass = () => {
    switch (norm) {
      case 'URGENT':
      case 'HIGH':
        return 'high';
      case 'MEDIUM':
        return 'medium';
      case 'LOW':
      default:
        return 'low';
    }
  };

  return (
    <span className={`tx-prio-pill tx-prio-${getPriorityClass()}`}>
      {norm}
    </span>
  );
}
