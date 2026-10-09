import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../../core/components/DataTable/DataTable';
import './CustomerList.css';

interface CustomerListProps {
  customers?: any[];
  loading?: boolean;
  onViewCustomer?: (c: any) => void;
  onEditCustomer?: (c: any) => void;
  onDeleteCustomer?: (c: any) => void;
}

export default function CustomerList({
  customers = [],
  loading = false,
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer
}: CustomerListProps) {
  const columns: any[] = [
    {
      header: 'Customer ID',
      key: 'id',
      render: (row: any) => <span className="tx-customer-id">{row.id}</span>
    },
    {
      header: 'Customer Name / Entity',
      key: 'name',
      render: (row: any) => (
        <div>
          <strong>{row.name}</strong>
          <div className="tx-muted-text">{row.businessName}</div>
        </div>
      )
    },
    {
      header: 'Contact Details',
      key: 'email',
      render: (row: any) => (
        <div>
          <div>{row.email}</div>
          <div className="tx-muted-text">{row.phone}</div>
        </div>
      )
    },
    {
      header: 'PAN / GSTIN',
      key: 'pan',
      render: (row: any) => (
        <div>
          <span className="tx-gst-badge">PAN: {row.pan}</span>
          <div>
            <span className="tx-gst-badge">GSTIN: {row.gstin}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Manager',
      key: 'assignedManagerName',
      render: (row: any) => (
        <span className="tx-manager-tag" style={{ fontSize: '0.82rem', color: '#083B75', fontWeight: 600 }}>
          {row.assignedManagerName || (row.domain === 'LOAN' ? 'Ananya Deshmukh' : 'Sanjay Verma')}
        </span>
      )
    },
    {
      header: 'Total Filings',
      key: 'totalApplications',
      render: (row: any) => <span>{row.totalApplications} Cases</span>
    },
    {
      header: 'KYC Status',
      key: 'kycStatus',
      render: (row: any) => (
        <span
          className={`tx-kyc-badge ${
            row.kycStatus === 'VERIFIED' ? 'verified' : 'pending'
          }`}
        >
          {row.kycStatus}
        </span>
      )
    },
    {
      header: 'Registered Date',
      key: 'joinedDate'
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row: any) => (
        <div className="tx-table-action-group">
          {onViewCustomer && (
            <button
              type="button"
              className="tx-btn-icon-action"
              onClick={() => onViewCustomer(row)}
              title="View Customer Dossier"
            >
              <Eye size={15} />
            </button>
          )}
          {onEditCustomer && (
            <button
              type="button"
              className="tx-btn-icon-action"
              onClick={() => onEditCustomer(row)}
              title="Edit Customer"
            >
              <Edit2 size={15} />
            </button>
          )}
          {onDeleteCustomer && (
            <button
              type="button"
              className="tx-btn-icon-action danger"
              onClick={() => onDeleteCustomer(row)}
              title="Deactivate / Delete Customer"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      loading={loading}
      searchPlaceholder="Search customers by name, entity, or PAN..."
      searchField="name"
    />
  );
}
