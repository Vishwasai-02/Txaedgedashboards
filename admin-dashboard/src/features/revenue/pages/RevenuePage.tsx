import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle2, Eye, Calendar, DollarSign, X } from 'lucide-react';
import RevenueSummaryCards from '../components/RevenueSummaryCards';
import DataTable from '../../../core/components/DataTable/DataTable';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import Button from '../../../core/components/Button/Button';
import { revenueApi } from '../services/revenueApi';
import './RevenuePage.css';

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('ALL');
  const [reconciling, setReconciling] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const [confirmReconcile, setConfirmReconcile] = useState(false);

  const loadRevenue = () => {
    revenueApi.getRevenueData().then((res) => {
      setData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    loadRevenue();
    const unsub = revenueApi.subscribe(() => loadRevenue());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExportCSV = () => {
    if (!data?.transactions) return;
    const transactions = filteredTransactions;
    const headers = ['Transaction ID', 'Application Ref', 'Client', 'Service Rendered', 'Amount', 'Payment Gateway', 'Status', 'Timestamp'];
    const rows = transactions.map((t: any) => [
      t.id,
      t.applicationId,
      `"${t.customer}"`,
      `"${t.service}"`,
      `"${t.amount}"`,
      t.mode,
      t.status,
      t.date
    ]);
    const csvContent = [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TaxEdge_Revenue_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${transactions.length} transactions as CSV.`, 'success');
  };

  const executeReconciliation = async () => {
    setConfirmReconcile(false);
    setReconciling(true);
    await revenueApi.reconcileSettlements();
    setTimeout(() => {
      setReconciling(false);
      showToast('All gateway settlement batches successfully reconciled with ICICI escrow account.', 'success');
    }, 600);
  };

  const filteredTransactions = (data?.transactions || []).filter((tx: any) => {
    if (dateFilter === 'ALL') return true;
    if (dateFilter === 'GATEWAY_RAZORPAY') return tx.mode.includes('Razorpay');
    if (dateFilter === 'GATEWAY_CASHFREE') return tx.mode.includes('Cashfree') || tx.mode.includes('NetBanking');
    if (dateFilter === 'SUCCESS') return tx.status === 'COMPLETED' || tx.status === 'SETTLED';
    return true;
  });

  const columns: any[] = [
    {
      header: 'Transaction ID',
      key: 'id',
      render: (row: any) => <strong>{row.id}</strong>
    },
    {
      header: 'Application Ref',
      key: 'applicationId'
    },
    {
      header: 'Client',
      key: 'customer'
    },
    {
      header: 'Service Rendered',
      key: 'service'
    },
    {
      header: 'Amount',
      key: 'amount',
      render: (row: any) => <strong>{row.amount}</strong>
    },
    {
      header: 'Payment Gateway',
      key: 'mode'
    },
    {
      header: 'Status',
      key: 'status',
      render: (row: any) => (
        <span className={`tx-rev-status-pill ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Timestamp',
      key: 'date'
    },
    {
      header: 'Action',
      key: 'action',
      sortable: false,
      render: (row: any) => (
        <button
          type="button"
          className="tx-btn-table-icon"
          onClick={() => setSelectedTx(row)}
          title="View Receipt"
        >
          <Eye size={15} />
        </button>
      )
    }
  ];

  return (
    <div className="tx-rev-page">
      {feedback && (
        <div className={`tx-rev-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-rev-page-header">
        <div className="tx-rev-page-title">
          <h2>Revenue &amp; Collections Management</h2>
          <p>
            Real-time financial reconciliation, gateway settlements, and billing receipts
          </p>
        </div>

        <div className="tx-rev-header-actions" style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            icon={<Download size={16} />}
            onClick={handleExportCSV}
          >
            Export Ledger (CSV)
          </Button>
          <Button
            variant="orange"
            icon={<RefreshCw size={16} className={reconciling ? 'tx-spin' : ''} />}
            onClick={() => setConfirmReconcile(true)}
            disabled={reconciling}
          >
            {reconciling ? 'Reconciling...' : 'Reconcile Settlements'}
          </Button>
        </div>
      </div>

      {data && (
        <RevenueSummaryCards
          timeframes={data.timeframes}
          breakdowns={data.breakdowns}
        />
      )}

      {/* Date & Gateway Filter Bar */}
      <div className="tx-rev-filter-bar">
        <div className="tx-filter-pills">
          <button
            type="button"
            className={`tx-filter-pill ${dateFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setDateFilter('ALL')}
          >
            All Settlements ({data?.transactions?.length || 0})
          </button>
          <button
            type="button"
            className={`tx-filter-pill ${dateFilter === 'SUCCESS' ? 'active' : ''}`}
            onClick={() => setDateFilter('SUCCESS')}
          >
            Settled / Cleared
          </button>
          <button
            type="button"
            className={`tx-filter-pill ${dateFilter === 'GATEWAY_RAZORPAY' ? 'active' : ''}`}
            onClick={() => setDateFilter('GATEWAY_RAZORPAY')}
          >
            Razorpay Direct
          </button>
          <button
            type="button"
            className={`tx-filter-pill ${dateFilter === 'GATEWAY_CASHFREE' ? 'active' : ''}`}
            onClick={() => setDateFilter('GATEWAY_CASHFREE')}
          >
            Cashfree &amp; NetBanking
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTransactions}
        loading={loading}
        searchPlaceholder="Search transactions by reference or customer..."
        searchField="customer"
      />

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Receipt Breakdown — ${selectedTx.id}`}
        >
          <div className="tx-receipt-card">
            <div className="tx-receipt-header">
              <div>
                <span className="tx-receipt-badge">TAX INVOICE RECEIPT</span>
                <h3>{selectedTx.amount}</h3>
                <span className="tx-receipt-date">Processed on {selectedTx.date}</span>
              </div>
              <span className={`tx-rev-status-pill ${selectedTx.status.toLowerCase()}`}>
                {selectedTx.status}
              </span>
            </div>

            <div className="tx-receipt-details-grid">
              <div className="tx-receipt-row">
                <span>Application Reference:</span>
                <strong>{selectedTx.applicationId}</strong>
              </div>
              <div className="tx-receipt-row">
                <span>Client Name:</span>
                <strong>{selectedTx.customer}</strong>
              </div>
              <div className="tx-receipt-row">
                <span>Service Rendered:</span>
                <strong>{selectedTx.service}</strong>
              </div>
              <div className="tx-receipt-row">
                <span>Gateway Channel:</span>
                <strong>{selectedTx.mode}</strong>
              </div>
              <div className="tx-receipt-row">
                <span>Escrow Settlement:</span>
                <strong style={{ color: '#2E7D32' }}>VERIFIED &amp; CREDITED</strong>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setSelectedTx(null)}>
                Close Receipt
              </Button>
              <Button
                variant="orange"
                onClick={() => {
                  showToast(`Invoice receipt for ${selectedTx.id} queued for client dispatch.`, 'info');
                  setSelectedTx(null);
                }}
              >
                Email Receipt to Client
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reconciliation Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmReconcile}
        onClose={() => setConfirmReconcile(false)}
        onConfirm={executeReconciliation}
        title="Initiate Gateway Settlement Reconciliation"
        message="Trigger automated reconciliation against Razorpay, Cashfree, and Bank Escrow accounts for today's batch?"
        variant="primary"
        confirmText="Start Reconciliation"
      />
    </div>
  );
}
