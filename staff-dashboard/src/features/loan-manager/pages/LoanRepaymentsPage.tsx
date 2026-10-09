import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, ArrowRight, DollarSign, Download, Bell, Send, Check } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import { loanManagerApi } from '../services/loanManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import './LoanRepaymentsPage.css';

export default function LoanRepaymentsPage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    installment: any;
  }>({
    isOpen: false,
    installment: null
  });

  // Demand Notice Modal
  const [demandModalOpen, setDemandModalOpen] = useState(false);
  const [demandType, setDemandType] = useState('NACH_UPCOMING');

  const loadSchedule = () => {
    loanManagerApi.getRepaymentSchedule().then((data) => {
      setSchedule(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadSchedule();
    const unsub = loanManagerApi.subscribe(() => loadSchedule());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const promptPayInstallment = (row: any) => {
    setConfirmModal({
      isOpen: true,
      installment: row
    });
  };

  const handleConfirmPay = () => {
    const row = confirmModal.installment;
    if (!row) return;

    setSchedule(
      schedule.map((r: any) =>
        r.installment === row.installment ? { ...r, status: 'PAID' } : r
      )
    );
    setConfirmModal({ isOpen: false, installment: null });
    setToast(`Installment #${row.installment} (₹${row.emi.toLocaleString('en-IN')}) marked as PAID via NACH electronic clearing.`);
    setTimeout(() => setToast(''), 4500);
  };

  const handleExportCsv = () => {
    const headers = ['Installment #', 'Due Date', 'Total EMI (INR)', 'Principal (INR)', 'Interest (INR)', 'Remaining Principal (INR)', 'Status'];
    const rows = schedule.map((r: any) => [
      r.installment,
      r.dueDate,
      r.emi,
      r.principal,
      r.interest,
      r.balance,
      r.status
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Amortization_Ledger_LN-APP-802_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast('Amortization schedule exported to CSV.');
    setTimeout(() => setToast(''), 3500);
  };

  const handleSendDemandNotice = (e: React.FormEvent) => {
    e.preventDefault();
    setDemandModalOpen(false);
    setToast(`Automated NACH repayment reminder dispatched to Sanjay Deshmukh via SMS & Email.`);
    setTimeout(() => setToast(''), 4500);
  };

  const filteredSchedule = schedule.filter((row: any) => {
    if (filter === 'PAID') return row.status === 'PAID';
    if (filter === 'PENDING') return row.status !== 'PAID';
    return true;
  });

  return (
    <div className="tx-loan-repayments-page">
      <PageHeader
        title="Amortization Schedule & EMI Recovery Ledger"
        subtitle="Monitor monthly principal/interest collections, automated NACH debits, and loan portfolio recovery"
        breadcrumb={['Loan Domain', 'Collections', 'Repayments']}
      />

      {toast && (
        <div className="tx-repay-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="tx-repay-kpis">
        <div className="tx-repay-kpi-card">
          <span className="tx-repay-kpi-val">100.0%</span>
          <span className="tx-repay-kpi-lbl">On-Time NACH Collection Rate</span>
        </div>
        <div className="tx-repay-kpi-card">
          <span className="tx-repay-kpi-val">0.0%</span>
          <span className="tx-repay-kpi-lbl">Portfolio Gross NPA Rate</span>
        </div>
        <div className="tx-repay-kpi-card">
          <span className="tx-repay-kpi-val">₹62,074</span>
          <span className="tx-repay-kpi-lbl">Standard Active Monthly EMI</span>
        </div>
      </div>

      <div className="tx-schedule-table-card">
        <div className="tx-schedule-header">
          <div>
            <h3 className="tx-sched-title">Sanjay Deshmukh — Housing Loan Amortization</h3>
            <span className="tx-sched-sub">Account: LN-APP-802 • ₹72,00,000 @ 8.40% p.a. • 240 Months</span>
          </div>

          <div className="tx-sched-header-actions">
            <div className="tx-sched-pills">
              <button
                type="button"
                className={`tx-sched-pill ${filter === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilter('ALL')}
              >
                All ({schedule.length})
              </button>
              <button
                type="button"
                className={`tx-sched-pill ${filter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setFilter('PENDING')}
              >
                Due / Upcoming ({schedule.filter((r: any) => r.status !== 'PAID').length})
              </button>
              <button
                type="button"
                className={`tx-sched-pill ${filter === 'PAID' ? 'active' : ''}`}
                onClick={() => setFilter('PAID')}
              >
                Settled ({schedule.filter((r: any) => r.status === 'PAID').length})
              </button>
            </div>

            <button
              type="button"
              className="tx-btn-remind"
              onClick={() => setDemandModalOpen(true)}
              title="Send automated borrower reminder"
            >
              <Bell size={14} />
              <span>Send NACH Notice</span>
            </button>

            <button
              type="button"
              className="tx-btn-export-csv"
              onClick={handleExportCsv}
              title="Download CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="tx-table-container">
          <table className="tx-schedule-table">
            <thead>
              <tr>
                <th>Inst #</th>
                <th>Due Date</th>
                <th>Total EMI (₹)</th>
                <th>Principal (₹)</th>
                <th>Interest (₹)</th>
                <th>Remaining Principal (₹)</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((row: any) => (
                <tr key={row.installment}>
                  <td>
                    <span className="tx-inst-pill">#{row.installment}</span>
                  </td>
                  <td>
                    <strong>{row.dueDate}</strong>
                  </td>
                  <td>₹{row.emi.toLocaleString('en-IN')}</td>
                  <td>₹{row.principal.toLocaleString('en-IN')}</td>
                  <td>₹{row.interest.toLocaleString('en-IN')}</td>
                  <td>
                    <span className="tx-balance-val">₹{row.balance.toLocaleString('en-IN')}</span>
                  </td>
                  <td>
                    <span className={`tx-inst-status ${(row.status || 'PENDING').toLowerCase()}`}>
                      {row.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="text-right">
                    {row.status !== 'PAID' ? (
                      <button
                        type="button"
                        className="tx-btn-collect-emi"
                        onClick={() => promptPayInstallment(row)}
                      >
                        <CheckCircle2 size={13} />
                        <span>Confirm NACH</span>
                      </button>
                    ) : (
                      <span className="tx-settled-text">✓ Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for NACH Confirmation */}
      {confirmModal.installment && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, installment: null })}
          onConfirm={handleConfirmPay}
          title={`Confirm NACH Settlement: Installment #${confirmModal.installment.installment}`}
          message={`Confirm electronic receipt of monthly EMI ₹${confirmModal.installment.emi.toLocaleString('en-IN')} due on ${confirmModal.installment.dueDate} for Sanjay Deshmukh (Account: LN-APP-802)?`}
          confirmText="Confirm NACH Payment"
          variant="primary"
        />
      )}

      {/* Demand Notice Modal */}
      <Modal
        isOpen={demandModalOpen}
        onClose={() => setDemandModalOpen(false)}
        title="Dispatch NACH Repayment Demand Advisory"
      >
        <form onSubmit={handleSendDemandNotice} className="tx-demand-modal-form">
          <p className="tx-demand-sub">
            Transmit an automated advisory to <strong>Sanjay Deshmukh</strong> reminding them to maintain sufficient balance in their primary bank account before the auto-debit run date.
          </p>

          <div className="tx-form-group">
            <label>Advisory Notice Category</label>
            <select value={demandType} onChange={(e) => setDemandType(e.target.value)}>
              <option value="NACH_UPCOMING">Upcoming NACH Debit Courtesy Reminder (3 Days Prior)</option>
              <option value="DEMAND_URGENT">Payment Due Notification (Same Day Action)</option>
              <option value="NACH_REPRESENTATION">NACH Representation Advisory (Post-Bounce Recovery)</option>
            </select>
          </div>

          <div className="tx-form-group">
            <label>Advisory Channels</label>
            <div className="tx-channel-tags">
              <span className="tx-channel-tag">SMS Gateway (Priority)</span>
              <span className="tx-channel-tag">Automated Email Notification</span>
              <span className="tx-channel-tag">Borrower Mobile App Push</span>
            </div>
          </div>

          <div className="tx-demand-modal-actions">
            <button
              type="button"
              className="tx-btn-modal-cancel"
              onClick={() => setDemandModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="tx-btn-send-demand">
              <Send size={14} />
              <span>Dispatch Repayment Advisory</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
