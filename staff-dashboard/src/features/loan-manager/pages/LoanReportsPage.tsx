import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, CheckCircle2, TrendingUp, ShieldCheck, Plus, Search, X } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import Modal from '../../../core/components/Modal/Modal';
import './LoanReportsPage.css';

const INITIAL_LOAN_REPORTS = [
  { id: 'LREP-01', title: 'Monthly Origin & Disbursement Volume Ledger', period: 'Sep 2026', volume: '₹3,45,00,000 (16 Disbursed)', format: 'EXCEL (.xlsx)', size: '3.2 MB', date: '01 Oct 2026' },
  { id: 'LREP-02', title: 'Portfolio Early Warning Signals (EWS) & SMA Audit', period: 'Q2 FY26', volume: 'Zero SMA-1 / SMA-2 accounts', format: 'PDF (.pdf)', size: '1.9 MB', date: '29 Sep 2026' },
  { id: 'LREP-03', title: 'Syndicate Lender Payout & Subvention Ledger', period: 'FY26-27 YTD', volume: '₹14,20,000 Commission Accrued', format: 'EXCEL (.xlsx)', size: '2.5 MB', date: '25 Sep 2026' },
  { id: 'LREP-04', title: 'Credit Bureau Score Drift & Underwriting SLA Audit', period: 'Sep 2026', volume: '6.2 Days Avg Origination TAT', format: 'PDF (.pdf)', size: '1.4 MB', date: '30 Sep 2026' },
];

export default function LoanReportsPage() {
  const [reports, setReports] = useState<any[]>(INITIAL_LOAN_REPORTS);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  // Custom Report Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('Quarterly Lending Portfolio Risk & Provisioning Audit');
  const [newPeriod, setNewPeriod] = useState('Q2 FY 2026-27');
  const [newVertical, setNewVertical] = useState('MSME Term & Working Capital');
  const [newFormat, setNewFormat] = useState('CSV (.csv)');

  const handleDownload = (rep: any) => {
    const csvContent = `Report Ref,${rep.id}\nReport Title,${rep.title}\nReporting Period,${rep.period}\nPortfolio Scope,${rep.volume}\nGenerated On,${rep.date}\nStatus,Audit Endorsed\nPlatform,TaxEdge Financial Services Credit Engine\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TaxEdge_Report_${rep.id}_${rep.period.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast(`Report "${rep.title}" exported successfully.`);
    setTimeout(() => setToast(''), 4000);
  };

  const handleGenerateCustomReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `LREP-0${reports.length + 1}`;
    const newEntry = {
      id: newId,
      title: newTitle,
      period: newPeriod,
      volume: `${newVertical} Portfolio Audit`,
      format: newFormat,
      size: '2.1 MB',
      date: 'Just now'
    };

    setReports([newEntry, ...reports]);
    setModalOpen(false);
    handleDownload(newEntry);
    setToast(`Custom audit report ${newId} generated and downloaded.`);
    setTimeout(() => setToast(''), 5000);
  };

  const filteredReports = reports.filter((r: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.title?.toLowerCase() || '').includes(q) ||
      (r.id?.toLowerCase() || '').includes(q) ||
      (r.period?.toLowerCase() || '').includes(q)
    );
  });

  return (
    <div className="tx-loan-reports-page">
      <PageHeader
        title="Lending Portfolio Audits & Syndicate Analytics"
        subtitle="Download origination volume summaries, early warning risk reports, and syndicate fee reconciliations"
        breadcrumb={['Loan Domain', 'Analytics', 'Reports']}
        actions={
          <button
            type="button"
            className="tx-btn-gen-report"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={15} />
            <span>Generate Custom Audit Report</span>
          </button>
        }
      />

      {toast && (
        <div className="tx-loan-rep-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="tx-loan-rep-kpis">
        <div className="tx-lrep-card">
          <span className="tx-lrep-val">₹3.45 Cr</span>
          <span className="tx-lrep-lbl">Disbursed Volume (September)</span>
        </div>
        <div className="tx-lrep-card">
          <span className="tx-lrep-val">0.00%</span>
          <span className="tx-lrep-lbl">Gross NPA Ratio</span>
        </div>
        <div className="tx-lrep-card">
          <span className="tx-lrep-val">96.8%</span>
          <span className="tx-lrep-lbl">First-Time Underwriting Clearance</span>
        </div>
      </div>

      <div className="tx-loan-reports-table-card">
        <div className="tx-lrep-table-header">
          <div className="tx-lrep-search-box">
            <Search size={15} className="tx-search-icon" />
            <input
              type="text"
              placeholder="Search reports by title or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="tx-search-clear-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span className="tx-lrep-count">{filteredReports.length} Available Audit Reports</span>
        </div>

        <div className="tx-table-container">
          <table className="tx-loan-rep-table">
            <thead>
              <tr>
                <th>Report Ref</th>
                <th>Report Title & Scope</th>
                <th>Reporting Period</th>
                <th>Portfolio Coverage</th>
                <th>Format</th>
                <th>File Size</th>
                <th>Generated</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((rep: any) => (
                <tr key={rep.id}>
                  <td>
                    <span className="tx-lrep-ref">{rep.id}</span>
                  </td>
                  <td>
                    <strong>{rep.title}</strong>
                  </td>
                  <td>{rep.period}</td>
                  <td>{rep.volume}</td>
                  <td>
                    <span className="tx-format-pill">{rep.format}</span>
                  </td>
                  <td>{rep.size}</td>
                  <td>{rep.date}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="tx-btn-dl-rep"
                      onClick={() => handleDownload(rep)}
                    >
                      <Download size={14} />
                      <span>Export</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Report Generator Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate Custom Portfolio Audit Report"
      >
        <form onSubmit={handleGenerateCustomReport} className="tx-custom-rep-form">
          <div className="tx-form-group">
            <label>Report Title &amp; Audit Subject</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="tx-form-row">
            <div className="tx-form-group">
              <label>Reporting Period</label>
              <select value={newPeriod} onChange={(e) => setNewPeriod(e.target.value)}>
                <option value="Current Month (Live)">Current Month (Live)</option>
                <option value="Q2 FY 2026-27">Q2 FY 2026-27</option>
                <option value="H1 FY 2026-27">H1 FY 2026-27</option>
                <option value="Full FY 2025-26">Full FY 2025-26</option>
              </select>
            </div>

            <div className="tx-form-group">
              <label>Lending Vertical</label>
              <select value={newVertical} onChange={(e) => setNewVertical(e.target.value)}>
                <option value="MSME Term & Working Capital">MSME Term &amp; Working Capital</option>
                <option value="Housing & Property LAP">Housing &amp; Property LAP</option>
                <option value="Machinery & Equipment Finance">Machinery &amp; Equipment Finance</option>
                <option value="Consolidated All Verticals">Consolidated All Verticals</option>
              </select>
            </div>
          </div>

          <div className="tx-form-group">
            <label>Export File Format</label>
            <select value={newFormat} onChange={(e) => setNewFormat(e.target.value)}>
              <option value="CSV (.csv)">Comma-Separated Values (.csv)</option>
              <option value="EXCEL (.xlsx)">Microsoft Excel Workbook (.xlsx)</option>
              <option value="PDF (.pdf)">PDF Executive Audit Brief (.pdf)</option>
            </select>
          </div>

          <div className="tx-custom-rep-footer">
            <button
              type="button"
              className="tx-btn-modal-cancel"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="tx-btn-submit-rep">
              <Download size={15} />
              <span>Compile &amp; Download Report</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
