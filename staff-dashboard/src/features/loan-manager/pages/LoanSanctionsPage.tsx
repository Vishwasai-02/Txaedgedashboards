import React, { useState, useEffect } from 'react';
import { FileCheck, Download, CheckCircle2, ArrowRight, ShieldCheck, Banknote, Search, X } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import { loanManagerApi } from '../services/loanManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import './LoanSanctionsPage.css';

export default function LoanSanctionsPage() {
  const [sanctions, setSanctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState('');

  // Disbursement Confirmation Modal
  const [disburseModal, setDisburseModal] = useState<{
    isOpen: boolean;
    sanction: any;
  }>({
    isOpen: false,
    sanction: null
  });

  const loadSanctions = () => {
    loanManagerApi.getSanctions().then((data) => {
      setSanctions(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadSanctions();
    const unsub = loanManagerApi.subscribe(() => loadSanctions());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const promptDisburse = (s: any) => {
    setDisburseModal({
      isOpen: true,
      sanction: s
    });
  };

  const handleConfirmDisburse = async () => {
    const s = disburseModal.sanction;
    if (!s) return;
    const result = await loanManagerApi.disburseSanction(s.sanctionId);
    const utr = (result as any)?.utr || `CMSICICI${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    loadSanctions();
    setDisburseModal({ isOpen: false, sanction: null });
    setToast(`Capital disbursed successfully via RTGS for ${s.borrower}. Generated UTR: ${utr}.`);
    setTimeout(() => setToast(''), 5000);
  };

  const handleDownloadSanction = (s: any) => {
    const content = `================================================================================
TAXEDGE FINANCIAL TECHNOLOGIES — OFFICIAL LOAN SANCTION MEMORANDUM
================================================================================
Sanction Reference ID : ${s.sanctionId}
Date of Sanction      : ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
Borrower Entity       : ${s.borrower}
Credit Facility Type  : ${s.loanType}

FINANCIAL FACILITY PARAMETERS
--------------------------------------------------------------------------------
Sanctioned Capital    : ₹${s.sanctionedAmount.toLocaleString('en-IN')}
Agreed Monthly EMI    : ${s.emi}
Applicable ROI        : ${s.roi}
Repayment Tenure      : ${s.tenure}
Lead Underwriting Bank: ${s.lender}
Processing Fee Paid   : ${s.processingFee}
Disbursement UTR      : ${s.utrNumber}
Disbursement Status   : ${s.disbursementStatus}

CONDITIONS PRECEDENT (CP) & ENDORSEMENTS
--------------------------------------------------------------------------------
1. Demand Promissory Note and Loan Agreement executed on non-judicial stamp paper.
2. Direct Debit (NACH Mandate) registered and tested on sponsor bank gateway.
3. Personal & Corporate Guarantees vetted by legal empanelled counsel.
4. Capital disbursement shall occur via RTGS exclusively to designated escrow account.

Authorized Signatory:
Chief Lending Officer & Head of Credit Syndication
TaxEdge Platform Services Pvt Ltd
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TaxEdge_Sanction_Letter_${s.sanctionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast(`Sanction Letter (${s.sanctionId}) exported successfully.`);
    setTimeout(() => setToast(''), 4000);
  };

  const filteredSanctions = sanctions.filter((s: any) => {
    if (filter === 'DISBURSED' && s.disbursementStatus !== 'DISBURSED') return false;
    if (filter === 'PENDING' && s.disbursementStatus === 'DISBURSED') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSearch =
        (s.borrower?.toLowerCase() || '').includes(q) ||
        (s.sanctionId?.toLowerCase() || '').includes(q) ||
        (s.loanType?.toLowerCase() || '').includes(q) ||
        (s.lender?.toLowerCase() || '').includes(q);
      if (!matchSearch) return false;
    }
    return true;
  });

  return (
    <div className="tx-loan-sanctions-page">
      <PageHeader
        title="Sanctions & Capital Disbursement Ledger"
        subtitle="Manage legally binding sanction letters, borrower acceptance signatures, and banking syndicate disbursement releases"
        breadcrumb={['Loan Domain', 'Settlement', 'Sanctions']}
      />

      {toast && (
        <div className="tx-sanction-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="tx-sanc-controls-bar">
        <div className="tx-sanc-search-box">
          <Search size={16} className="tx-search-icon" />
          <input
            type="text"
            placeholder="Search by Sanction ID, Borrower, or Lender..."
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

        <div className="tx-sanc-pills">
          <button
            type="button"
            className={`tx-sanc-pill ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All Sanctions ({sanctions.length})
          </button>
          <button
            type="button"
            className={`tx-sanc-pill ${filter === 'DISBURSED' ? 'active' : ''}`}
            onClick={() => setFilter('DISBURSED')}
          >
            Disbursed ({sanctions.filter((s: any) => s.disbursementStatus === 'DISBURSED').length})
          </button>
          <button
            type="button"
            className={`tx-sanc-pill ${filter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            Pending Release ({sanctions.filter((s: any) => s.disbursementStatus !== 'DISBURSED').length})
          </button>
        </div>
      </div>

      <div className="tx-sanctions-grid">
        {filteredSanctions.map((s: any) => (
          <div key={s.sanctionId} className="tx-sanction-card">
            <div className="tx-sanction-header">
              <div>
                <span className="tx-sanc-id">{s.sanctionId}</span>
                <h3 className="tx-sanc-borrower">{s.borrower}</h3>
                <span className="tx-sanc-type">{s.loanType}</span>
              </div>
              <StatusBadge status={s.disbursementStatus} />
            </div>

            <div className="tx-sanc-amount-row">
              <div className="tx-sanc-amt-box">
                <span className="tx-amt-lbl">Sanctioned Amount</span>
                <span className="tx-amt-val">₹{s.sanctionedAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="tx-sanc-amt-box">
                <span className="tx-amt-lbl">Agreed Monthly EMI</span>
                <span className="tx-amt-val">{s.emi}</span>
              </div>
            </div>

            <div className="tx-sanc-details-grid">
              <div className="tx-detail-item">
                <span className="tx-detail-lbl">Interest Rate (ROI)</span>
                <span className="tx-detail-val">{s.roi}</span>
              </div>
              <div className="tx-detail-item">
                <span className="tx-detail-lbl">Repayment Tenure</span>
                <span className="tx-detail-val">{s.tenure}</span>
              </div>
              <div className="tx-detail-item">
                <span className="tx-detail-lbl">Underwriting Lender</span>
                <span className="tx-detail-val">{s.lender}</span>
              </div>
              <div className="tx-detail-item">
                <span className="tx-detail-lbl">Processing Fee Paid</span>
                <span className="tx-detail-val">{s.processingFee}</span>
              </div>
            </div>

            <div className="tx-utr-box">
              <span className="tx-utr-lbl">Disbursement UTR Reference:</span>
              <code className="tx-utr-code">{s.utrNumber}</code>
              <span className="tx-utr-date">{s.disbursedDate}</span>
            </div>

            <div className="tx-sanc-actions">
              <button
                type="button"
                className="tx-btn-sanc-download"
                onClick={() => handleDownloadSanction(s)}
              >
                <Download size={14} />
                <span>Sanction Memo (.txt)</span>
              </button>

              {s.disbursementStatus !== 'DISBURSED' && (
                <button
                  type="button"
                  className="tx-btn-disburse"
                  onClick={() => promptDisburse(s)}
                >
                  <Banknote size={14} />
                  <span>Release Disbursement</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Disbursement Confirmation Modal */}
      {disburseModal.sanction && (
        <ConfirmationModal
          isOpen={disburseModal.isOpen}
          onClose={() => setDisburseModal({ isOpen: false, sanction: null })}
          onConfirm={handleConfirmDisburse}
          title="Authorize RTGS Capital Disbursement"
          message={`Are you sure you want to authorize tranche release of ₹${disburseModal.sanction.sanctionedAmount.toLocaleString('en-IN')} via RTGS to the verified escrow account of "${disburseModal.sanction.borrower}"? Underwriting syndicate: ${disburseModal.sanction.lender}.`}
          confirmText="Authorize & Release RTGS"
          variant="primary"
        />
      )}
    </div>
  );
}
