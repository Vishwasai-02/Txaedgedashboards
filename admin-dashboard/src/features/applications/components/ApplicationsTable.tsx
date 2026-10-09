import React from 'react';
import { Eye } from 'lucide-react';
import DataTable from '../../../core/components/DataTable/DataTable';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import PriorityBadge from '../../../core/components/PriorityBadge/PriorityBadge';
import { APPLICATION_STATUS, PAYMENT_STATUS } from '../../../core/constants/statusEnums';
import { ApplicationItem } from '../../../shared/types/workflowTypes';
import './ApplicationsTable.css';

export interface ApplicationsTableProps {
  applications?: ApplicationItem[];
  loading?: boolean;
  onViewDetail?: (app: ApplicationItem) => void;
  emptyMessage?: string;
}

export default function ApplicationsTable({
  applications = [],
  loading = false,
  onViewDetail,
  emptyMessage = 'No applications found'
}: ApplicationsTableProps) {
  const columns = [
    {
      header: 'Application ID',
      key: 'id',
      render: (row: ApplicationItem) => <span className="tx-app-id-badge">{row.id}</span>
    },
    {
      header: 'Customer',
      key: 'customerName',
      render: (row: ApplicationItem) => (
        <div className="tx-customer-cell">
          <strong>{row.customerName || row.borrower || 'N/A'}</strong>
          <span className="tx-customer-sub">{row.customerPhone || (row as any).phone || ''}</span>
        </div>
      )
    },
    {
      header: 'Service',
      key: 'service',
      render: (row: ApplicationItem) => row.service || row.loanType || 'N/A'
    },
    {
      header: 'Submitted Date',
      key: 'submittedDate'
    },
    {
      header: 'Documents',
      key: 'documentsCount'
    },
    {
      header: 'Payment Status',
      key: 'paymentStatus',
      render: (row: ApplicationItem) => (
        <span
          className={`tx-payment-badge ${
            row.paymentStatus === PAYMENT_STATUS.COMPLETED ? 'paid' : 'pending'
          }`}
        >
          {row.paymentStatus}
        </span>
      )
    },
    {
      header: 'Assigned Executive',
      key: 'assignedExecutive'
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (row: ApplicationItem) => <PriorityBadge priority={row.priority} />
    },
    {
      header: 'Current Status',
      key: 'status',
      render: (row: ApplicationItem) => <StatusBadge status={row.status} />
    },
    {
      header: 'Due Date',
      key: 'dueDate'
    },
    {
      header: 'Action',
      key: 'action',
      render: (row: ApplicationItem) => (
        <button
          type="button"
          className="tx-btn-table-view"
          onClick={() => onViewDetail && onViewDetail(row)}
          title="Inspect Application Details"
        >
          <Eye size={15} />
          <span>View</span>
        </button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={applications}
      loading={loading}
      emptyMessage={emptyMessage}
      searchPlaceholder="Search by Application ID, Customer, or Service..."
    />
  );
}
