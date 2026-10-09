import React from 'react';
import './RevenueSummaryCards.css';

export default function RevenueSummaryCards({ timeframes, breakdowns }: { timeframes?: any; breakdowns?: any }) {
  if (!timeframes || !breakdowns) return null;

  return (
    <>
      <div className="tx-rev-cards-grid">
        <div className="tx-rev-card">
          <span className="tx-rev-card-period">Today's Collections</span>
          <span className="tx-rev-card-val">{timeframes.today}</span>
        </div>
        <div className="tx-rev-card">
          <span className="tx-rev-card-period">This Week</span>
          <span className="tx-rev-card-val">{timeframes.thisWeek}</span>
        </div>
        <div className="tx-rev-card">
          <span className="tx-rev-card-period">This Month</span>
          <span className="tx-rev-card-val">{timeframes.thisMonth}</span>
        </div>
        <div className="tx-rev-card">
          <span className="tx-rev-card-period">Current Financial Year</span>
          <span className="tx-rev-card-val">{timeframes.thisYear}</span>
        </div>
      </div>

      <div className="tx-breakdown-row">
        <div className="tx-breakdown-item">
          <span className="tx-breakdown-label">Settled / Paid</span>
          <span className="tx-breakdown-value paid">{breakdowns.paid}</span>
        </div>
        <div className="tx-breakdown-item">
          <span className="tx-breakdown-label">Pending Invoices</span>
          <span className="tx-breakdown-value pending">{breakdowns.pending}</span>
        </div>
        <div className="tx-breakdown-item">
          <span className="tx-breakdown-label">Partial Payments</span>
          <span className="tx-breakdown-value partial">{breakdowns.partial}</span>
        </div>
        <div className="tx-breakdown-item">
          <span className="tx-breakdown-label">Refunded</span>
          <span className="tx-breakdown-value refunded">{breakdowns.refunded}</span>
        </div>
        <div className="tx-breakdown-item">
          <span className="tx-breakdown-label">Outstanding Balance</span>
          <span className="tx-breakdown-value">{breakdowns.outstanding}</span>
        </div>
      </div>
    </>
  );
}
