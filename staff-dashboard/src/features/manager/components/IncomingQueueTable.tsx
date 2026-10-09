import React from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../core/components/DataTable/DataTable';
import Button from '../../../core/components/Button/Button';
import './IncomingQueueTable.css';

export interface IncomingQueueTableProps {
  applications?: any[];
  loading?: boolean;
}

export default function IncomingQueueTable({ applications = [], loading = false }: IncomingQueueTableProps) {
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Application ID',
      key: 'id',
      render: (row: any) => <span className="tx-mgr-app-id">{row.id}</span>
    },
    {
      header: 'Customer',
      key: 'customerName',
      render: (row: any) => (
        <div>
          <strong>{row.customerName}</strong>
          <div className="tx-muted-text">{row.customerPhone}</div>
        </div>
      )
    },
    {
      header: 'Service',
      key: 'service'
    },
    {
      header: 'Submitted Date',
      key: 'submittedDate'
    },
    {
      header: 'Payment',
      key: 'paymentStatus'
    },
    {
      header: 'Assigned Agent',
      key: 'assignedExecutive'
    },
    {
      header: 'Priority',
      key: 'priority'
    },
    {
      header: 'Status',
      key: 'status',
      render: (row: any) => <span>{(row.status || 'PENDING').replace(/_/g, ' ')}</span>
    },
    {
      header: 'Verification Action',
      key: 'action',
      render: (row: any) => (
        <div className="tx-queue-actions">
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/manager/verify/${row.id}`)}
          >
            Review &amp; Verify
          </Button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={applications}
      loading={loading}
      searchPlaceholder="Search incoming applications..."
      searchField="customerName"
    />
  );
}
