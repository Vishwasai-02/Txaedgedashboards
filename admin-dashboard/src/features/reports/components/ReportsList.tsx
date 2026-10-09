import React from 'react';
import { Download } from 'lucide-react';
import DataTable from '../../../core/components/DataTable/DataTable';
import Button from '../../../core/components/Button/Button';
import './ReportsList.css';

interface ReportsListProps {
  reports?: any[];
  loading?: boolean;
  onDownload?: (row: any) => void;
}

export default function ReportsList({ reports = [], loading = false, onDownload }: ReportsListProps) {
  const columns: any[] = [
    {
      header: 'Report Ref',
      key: 'id',
      render: (row: any) => <strong>{row.id}</strong>
    },
    {
      header: 'Report Title',
      key: 'name',
      render: (row: any) => (
        <div>
          <strong>{row.name}</strong>
          <div className="tx-muted-text">{row.category}</div>
        </div>
      )
    },
    {
      header: 'Total Rows',
      key: 'records',
      render: (row: any) => <span>{row.records.toLocaleString()} rows</span>
    },
    {
      header: 'Supported Formats',
      key: 'format',
      render: (row: any) => <span className="tx-format-badge">{row.format}</span>
    },
    {
      header: 'File Size',
      key: 'size'
    },
    {
      header: 'Generated Date',
      key: 'generatedDate'
    },
    {
      header: 'Export',
      key: 'action',
      sortable: false,
      render: (row: any) => (
        <Button
          size="sm"
          variant="secondary"
          icon={<Download size={14} />}
          onClick={() => onDownload && onDownload(row)}
        >
          Export
        </Button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={reports}
      loading={loading}
      searchPlaceholder="Search generated reports by name..."
      searchField="name"
    />
  );
}
