import React from 'react';
import { Edit2, ShieldAlert, KeyRound, MessageSquare } from 'lucide-react';
import DataTable from '../../../core/components/DataTable/DataTable';
import Button from '../../../core/components/Button/Button';
import './EmployeeList.css';

interface EmployeeListProps {
  employees?: any[];
  roleType?: string;
  onEditEmployee?: (emp: any) => void;
  onToggleStatus?: (emp: any) => void;
  onResetPassword?: (emp: any) => void;
  onMessageEmployee?: (emp: any) => void;
}

export default function EmployeeList({
  employees = [],
  roleType = 'MANAGER',
  onEditEmployee,
  onToggleStatus,
  onResetPassword,
  onMessageEmployee
}: EmployeeListProps) {
  const columns: any[] = [
    {
      header: 'ID',
      key: 'id'
    },
    {
      header: 'Name',
      key: 'name',
      render: (row: any) => <strong>{row.name}</strong>
    },
    {
      header: 'Email / Phone',
      key: 'email',
      render: (row: any) => (
        <div>
          <div>{row.email}</div>
          <div className="tx-muted-text">{row.phone}</div>
        </div>
      )
    },
    {
      header: 'Department / Team',
      key: 'team'
    },
    ...(roleType === 'AGENT'
      ? [
          {
            header: 'Reporting Manager',
            key: 'managerName'
          },
          {
            header: 'Active Cases',
            key: 'activeCases'
          },
          {
            header: 'Rating',
            key: 'rating',
            render: (row: any) => <span>★ {row.rating}</span>
          }
        ]
      : [
          {
            header: 'Direct Reports',
            key: 'directReports'
          }
        ]),
    {
      header: 'Status',
      key: 'status',
      render: (row: any) => (
        <span
          className={`tx-emp-status-badge ${
            row.status === 'ACTIVE' ? 'active' : 'disabled'
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row: any) => (
        <div className="tx-emp-actions-group">
          {onMessageEmployee && (
            <Button
              size="sm"
              variant="orange"
              onClick={() => onMessageEmployee(row)}
              title={`Direct bilateral message with ${row.name}`}
            >
              <MessageSquare size={13} style={{ marginRight: '4px' }} />
              Message
            </Button>
          )}
          {onEditEmployee && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEditEmployee(row)}
              title="Edit Profile"
            >
              <Edit2 size={13} style={{ marginRight: '4px' }} />
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant={row.status === 'ACTIVE' ? 'secondary' : 'primary'}
            onClick={() => onToggleStatus && onToggleStatus(row)}
            title={row.status === 'ACTIVE' ? 'Disable Account' : 'Activate Account'}
          >
            {row.status === 'ACTIVE' ? 'Disable' : 'Enable'}
          </Button>
          <Button
            size="sm"
            variant="text"
            onClick={() => onResetPassword && onResetPassword(row)}
            title="Reset Password"
          >
            <KeyRound size={13} style={{ marginRight: '4px' }} />
            Reset Pwd
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="tx-employee-list-container">
      <DataTable
        columns={columns}
        data={employees}
        searchPlaceholder={`Search ${roleType.toLowerCase()}s by name or email...`}
        searchField="name"
      />
    </div>
  );
}
