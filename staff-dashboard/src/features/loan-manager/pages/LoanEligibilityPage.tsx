import React, { useState } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, ArrowRight, Download, Sliders } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import Modal from '../../../core/components/Modal/Modal';
import './LoanEligibilityPage.css';

export default function LoanEligibilityPage() {
  const [borrowerName, setBorrowerName] = useState('Apex Enterprises / Sanjay Deshmukh');
  const [income, setIncome] = useState(150000);
  const [existingEmi, setExistingEmi] = useState(35000);
  const [tenureYears, setTenureYears] = useState(15);
  const [interestRate, setInterestRate] = useState(8.5);
  const [vintageYears, setVintageYears] = useState(4);
  const [cibilScore, setCibilScore] = useState(760);
  const [toast, setToast] = useState('');
  const [certModalOpen, setCertModalOpen] = useState(false);

  // Calculations
  const maxAllowedFoir = 0.50; // 50% FOIR limit
  const maxTotalEmi = Math.max(0, income * maxAllowedFoir);
  const availableEmi = Math.max(0, maxTotalEmi - existingEmi);

  // Loan eligibility formula from available EMI
  // P = E * [ (1+r)^n - 1 ] / [ r*(1+r)^n ]
  const monthlyRate = interestRate > 0 ? interestRate / 12 / 100 : 0.001;
  const totalMonths = tenureYears * 12;
  const estimatedEligibleLoan = availableEmi > 0 && monthlyRate > 0
    ? Math.round(
        availableEmi * (Math.pow(1 + monthlyRate, totalMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))
      )
    : 0;

  const foirActual = income > 0 ? ((existingEmi / income) * 100).toFixed(1) : '100.0';
  const isEligible = cibilScore >= 700 && Number(foirActual) <= 50 && vintageYears >= 2 && income >= 25000;

  const handleOpenCertificate = () => {
    if (!isEligible) return;
    setCertModalOpen(true);
  };

  const handleDownloadCertificate = () => {
    const certRef = `TX-ELG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const content = `===============================================================
TAXEDGE FINANCIAL TECHNOLOGIES — CREDIT PRE-QUALIFICATION CLEARANCE
===============================================================
Certificate Reference : ${certRef}
Date of Appraisal     : ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
Borrower / Entity     : ${borrowerName}

FINANCIAL APPRAISAL PARAMETERS
---------------------------------------------------------------
Gross Monthly Inflow / Surplus   : ₹${income.toLocaleString('en-IN')}
Existing Debt Obligations (EMI)  : ₹${existingEmi.toLocaleString('en-IN')}
Calculated FOIR Ratio            : ${foirActual}% (Syndicate Cap: 50%)
Assessed TransUnion CIBIL Score  : ${cibilScore} (${cibilScore >= 750 ? 'Prime Commercial' : 'Qualified'})
Operating Vintage / Track Record : ${vintageYears} Years

CREDIT UNDERWRITING CLEARANCE VERDICT
---------------------------------------------------------------
Status                           : PRE-QUALIFIED ELIGIBLE
Maximum Permissible Loan Capital : ₹${estimatedEligibleLoan.toLocaleString('en-IN')}
Sanction Tenure Appraisal        : ${tenureYears} Years (${totalMonths} Monthly Installments)
Benchmark Indicative ROI         : ${interestRate}% per annum
Permissible Monthly New EMI Cap  : ₹${Math.round(availableEmi).toLocaleString('en-IN')}

RECOMMENDED SYNDICATE BANK PARTNERS
---------------------------------------------------------------
1. HDFC Bank Commercial Credit Desk
2. ICICI Bank SME & Priority Sector Lending
3. State Bank of India (MSME Project Finance)

Digitally Certified by:
TaxEdge Automated Risk Underwriting Engine & Credit Bureau Gateway
===============================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TaxEdge_Eligibility_Clearance_${certRef}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCertModalOpen(false);
    setToast(`Eligibility Clearance Certificate (${certRef}) downloaded successfully.`);
    setTimeout(() => setToast(''), 4500);
  };

  return (
    <div className="tx-loan-eligibility-page">
      <PageHeader
        title="Borrower Credit Eligibility & FOIR Appraisal Engine"
        subtitle="Simulate debt-servicing capability, benchmark against lender FOIR caps, and generate pre-qualification clearance"
        breadcrumb={['Loan Domain', 'Appraisal', 'Eligibility']}
      />

      {toast && (
        <div className="tx-elig-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="tx-elig-grid">
        <div className="tx-elig-inputs-card">
          <div className="tx-inputs-header">
            <h3 className="tx-card-title">Borrower Financial Parameters</h3>
            <span className="tx-slider-hint"><Sliders size={13} /> Interactive Real-time Calculator</span>
          </div>

          <div className="tx-form-group">
            <label>Applicant / Borrower Entity Name</label>
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="e.g. Apex Enterprises / Sanjay Deshmukh"
            />
          </div>

          <div className="tx-form-group">
            <div className="tx-label-row">
              <label>Gross Monthly Income / Net Surplus (₹)</label>
              <span className="tx-range-val">₹{income.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="20000"
              max="1000000"
              step="5000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="tx-range-slider"
            />
            <input
              type="number"
              step="5000"
              value={income}
              onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
            />
          </div>

          <div className="tx-form-group">
            <div className="tx-label-row">
              <label>Existing Monthly EMI Obligations (₹)</label>
              <span className="tx-range-val">₹{existingEmi.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="1000"
              value={existingEmi}
              onChange={(e) => setExistingEmi(Number(e.target.value))}
              className="tx-range-slider"
            />
            <input
              type="number"
              step="1000"
              value={existingEmi}
              onChange={(e) => setExistingEmi(Math.max(0, Number(e.target.value)))}
            />
          </div>

          <div className="tx-form-row">
            <div className="tx-form-group">
              <label>Requested Loan Tenure (Years)</label>
              <select
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
              >
                <option value="3">3 Years (MSME Term)</option>
                <option value="5">5 Years (Equipment/Vehicle)</option>
                <option value="10">10 Years (LAP)</option>
                <option value="15">15 Years (Housing)</option>
                <option value="20">20 Years (Housing Long Term)</option>
                <option value="25">25 Years (Extended Housing)</option>
              </select>
            </div>
            <div className="tx-form-group">
              <label>Indicative Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                min="5"
                max="25"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="tx-form-row">
            <div className="tx-form-group">
              <label>Business Vintage / Job Tenure (Years)</label>
              <input
                type="number"
                min="0"
                max="40"
                value={vintageYears}
                onChange={(e) => setVintageYears(Number(e.target.value))}
              />
            </div>
            <div className="tx-form-group">
              <div className="tx-label-row">
                <label>Bureau CIBIL Score</label>
                <span className="tx-range-val">{cibilScore}</span>
              </div>
              <input
                type="range"
                min="300"
                max="900"
                step="5"
                value={cibilScore}
                onChange={(e) => setCibilScore(Number(e.target.value))}
                className="tx-range-slider"
              />
              <input
                type="number"
                min="300"
                max="900"
                value={cibilScore}
                onChange={(e) => setCibilScore(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="tx-elig-result-card">
          <div className={`tx-verdict-banner ${isEligible ? 'eligible' : 'ineligible'}`}>
            <div className="tx-verdict-icon">
              {isEligible ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
            </div>
            <div>
              <span className="tx-verdict-title">{isEligible ? 'PRE-QUALIFIED ELIGIBLE' : 'HIGH RISK / POLICY BREACH'}</span>
              <p className="tx-verdict-sub">
                {isEligible
                  ? 'Borrower meets banking syndicate debt-service benchmarks.'
                  : Number(foirActual) > 50
                    ? `FOIR of ${foirActual}% exceeds banking cap (50%). Reduce existing debt.`
                    : cibilScore < 700
                      ? `CIBIL score (${cibilScore}) is below prime lending threshold (700).`
                      : 'Business vintage must be at least 2 years.'}
              </p>
            </div>
          </div>

          <div className="tx-elig-stats-grid">
            <div className="tx-stat-item highlight">
              <span className="tx-item-lbl">Max Estimated Loan Eligible</span>
              <span className="tx-item-val">₹{estimatedEligibleLoan.toLocaleString('en-IN')}</span>
            </div>
            <div className="tx-stat-item">
              <span className="tx-item-lbl">Max Permissible New EMI</span>
              <span className="tx-item-val">₹{Math.round(availableEmi).toLocaleString('en-IN')}/mo</span>
            </div>
            <div className="tx-stat-item">
              <span className="tx-item-lbl">Current FOIR Ratio</span>
              <span className="tx-item-val">{foirActual}% (Cap: 50%)</span>
            </div>
            <div className="tx-stat-item">
              <span className="tx-item-lbl">Bureau CIBIL Status</span>
              <span className="tx-item-val">{cibilScore} ({cibilScore >= 750 ? 'Prime' : cibilScore >= 700 ? 'Standard' : 'Subprime'})</span>
            </div>
            <div className="tx-stat-item">
              <span className="tx-item-lbl">Tenure & Rate</span>
              <span className="tx-item-val">{tenureYears} Yrs @ {interestRate}%</span>
            </div>
            <div className="tx-stat-item">
              <span className="tx-item-lbl">Net Disposable Surplus</span>
              <span className="tx-item-val">₹{(income - existingEmi).toLocaleString('en-IN')}/mo</span>
            </div>
          </div>

          <div className="tx-elig-actions">
            <button
              type="button"
              className="tx-btn-cert"
              disabled={!isEligible}
              onClick={handleOpenCertificate}
            >
              <FileCheck size={16} />
              <span>Issue Eligibility Pre-Clearance Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pre-Clearance Certificate Modal */}
      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title="Credit Pre-Qualification Clearance Certificate"
      >
        <div className="tx-cert-modal-body">
          <div className="tx-cert-badge-row">
            <ShieldCheck size={28} className="tx-cert-icon" />
            <div>
              <h4 className="tx-cert-heading">Pre-Approved Credit Clearance</h4>
              <p className="tx-cert-subheading">Official Pre-Qualification Record for Banking Syndicate Submission</p>
            </div>
          </div>

          <div className="tx-cert-details-grid">
            <div className="tx-cert-detail-item">
              <span className="tx-cd-lbl">Borrower / Entity</span>
              <strong className="tx-cd-val">{borrowerName}</strong>
            </div>
            <div className="tx-cert-detail-item">
              <span className="tx-cd-lbl">Eligible Sanction Amount</span>
              <strong className="tx-cd-val highlight">₹{estimatedEligibleLoan.toLocaleString('en-IN')}</strong>
            </div>
            <div className="tx-cert-detail-item">
              <span className="tx-cd-lbl">Max Permissible EMI</span>
              <strong className="tx-cd-val">₹{Math.round(availableEmi).toLocaleString('en-IN')}/mo</strong>
            </div>
            <div className="tx-cert-detail-item">
              <span className="tx-cd-lbl">Appraisal FOIR Ratio</span>
              <strong className="tx-cd-val">{foirActual}% (Under 50% Cap)</strong>
            </div>
            <div className="tx-cert-detail-item">
              <span className="tx-cd-lbl">Bureau CIBIL Rating</span>
              <strong className="tx-cd-val">{cibilScore} — Prime Commercial</strong>
            </div>
            <div className="tx-cert-detail-item">
              <span className="tx-cd-lbl">Approved Syndicate Banks</span>
              <strong className="tx-cd-val">HDFC Bank, ICICI Bank, SBI Commercial</strong>
            </div>
          </div>

          <div className="tx-cert-modal-actions">
            <button
              type="button"
              className="tx-btn-cert-download"
              onClick={handleDownloadCertificate}
            >
              <Download size={15} />
              <span>Download Official Clearance Certificate (.txt)</span>
            </button>
            <button
              type="button"
              className="tx-btn-cert-cancel"
              onClick={() => setCertModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
