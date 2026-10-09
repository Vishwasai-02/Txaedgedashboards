import React, { useState } from 'react';
import Button from '../../../core/components/Button/Button';
import './VerificationPanel.css';

export interface VerificationPanelProps {
  application: any;
  onUpdatePricing: (pricingData: { basePrice: number | string; additionalCharges: number | string; discount: number | string }) => void;
  onOpenAssignModal: () => void;
}

export default function VerificationPanel({
  application,
  onUpdatePricing,
  onOpenAssignModal
}: VerificationPanelProps) {
  const [basePrice, setBasePrice] = useState(application?.basePrice || 5000);
  const [additionalCharges, setAdditionalCharges] = useState(application?.additionalCharges || 1000);
  const [discount, setDiscount] = useState(application?.discount || 500);

  const [toast, setToast] = useState('');

  if (!application) return null;

  const calculatedTotal = Number(basePrice) + Number(additionalCharges) - Number(discount);

  const trackerSteps = [
    { title: 'Submitted', done: true },
    { title: 'Docs Uploaded', done: true },
    { title: 'Docs Verified', done: true },
    { title: 'Payment Done', done: application.paymentStatus === 'Payment Completed' },
    { title: 'Assigned', done: !!application.assignedExecutive },
    { title: 'Processing', done: application.status === 'PROCESSING' },
    { title: 'Govt Portal', done: false },
    { title: 'Completed', done: false }
  ];

  const handlePricingSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePricing({
      basePrice,
      additionalCharges,
      discount
    });
    setToast(`Pricing saved: Final Amount ₹${calculatedTotal.toLocaleString('en-IN')}`);
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="tx-verif-panel">
      <div className="tx-verif-header">
        <div className="tx-verif-app-meta">
          <span className="tx-verif-id">{application.id}</span>
          <span className="tx-verif-service-pill">{application.service}</span>
          <span>
            Client: <strong>{application.customerName}</strong> ({application.customerPhone})
          </span>
        </div>
        <Button variant="orange" onClick={onOpenAssignModal}>
          Assign / Reassign Executive
        </Button>
      </div>

      <div className="tx-tracker-track">
        {trackerSteps.map((step, idx) => (
          <React.Fragment key={step.title}>
            <div className={`tx-tracker-node ${step.done ? 'done' : ''}`}>
              <span className="tx-tracker-dot" />
              <span>{step.title}</span>
            </div>
            {idx < trackerSteps.length - 1 && (
              <span className="tx-tracker-arrow">→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {toast && (
        <div className="tx-pricing-toast">
          <span>✓ {toast}</span>
        </div>
      )}

      <form className="tx-pricing-box" onSubmit={handlePricingSave}>
        <div className="tx-pricing-header">
          Section 7: Pricing Determination &amp; Invoicing
        </div>
        <div className="tx-pricing-grid">
          <div className="tx-pricing-item">
            <label className="tx-pricing-label">Base Service Price (₹)</label>
            <input
              type="number"
              className="tx-pricing-input"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
            />
          </div>
          <div className="tx-pricing-item">
            <label className="tx-pricing-label">Additional Services (₹)</label>
            <input
              type="number"
              className="tx-pricing-input"
              value={additionalCharges}
              onChange={(e) => setAdditionalCharges(e.target.value)}
            />
          </div>
          <div className="tx-pricing-item">
            <label className="tx-pricing-label">Discount (₹)</label>
            <input
              type="number"
              className="tx-pricing-input"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
          <div className="tx-pricing-item">
            <label className="tx-pricing-label">Final Payable</label>
            <div className="tx-pricing-total">₹ {calculatedTotal.toLocaleString()}</div>
          </div>
        </div>
        <div className="tx-queue-actions">
          <Button type="submit" variant="primary" size="sm">
            Save &amp; Generate Payment Request
          </Button>
        </div>
      </form>
    </div>
  );
}
