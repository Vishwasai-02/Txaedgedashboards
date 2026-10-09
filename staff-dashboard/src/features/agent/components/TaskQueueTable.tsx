import React from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../core/components/DataTable/DataTable';
import Button from '../../../core/components/Button/Button';
import './TaskQueueTable.css';

export interface TaskQueueTableProps {
  tasks?: any[];
  loading?: boolean;
}

export default function TaskQueueTable({ tasks = [], loading = false }: TaskQueueTableProps) {
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Task ID',
      key: 'id',
      render: (row: any) => <span className="tx-task-id-badge">{row.id}</span>
    },
    {
      header: 'Application Ref',
      key: 'applicationId',
      render: (row: any) => <span className="tx-app-id-badge">{row.applicationId}</span>
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
      header: 'Priority',
      key: 'priority',
      render: (row: any) => (
        <span className={`tx-priority-badge ${(row.priority || 'MEDIUM').toLowerCase()}`}>
          {row.priority || 'MEDIUM'}
        </span>
      )
    },
    {
      header: 'Target Deadline',
      key: 'deadline'
    },
    {
      header: 'Status',
      key: 'status',
      render: (row: any) => (
        <span className={`tx-task-status ${(row.status || 'PENDING').toLowerCase()}`}>
          {(row.status || 'PENDING').replace(/_/g, ' ')}
        </span>
      )
    },
    {
      header: 'Action',
      key: 'action',
      render: (row: any) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate(`/agent/tasks/${row.id}`)}
        >
          Open Task
        </Button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={tasks}
      loading={loading}
      searchPlaceholder="Search assigned tasks by ID or customer..."
      searchField="customerName"
    />
  );
}
