import React from 'react';
import { Phone, Mail, UserPlus, ArrowRight } from 'lucide-react';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import { LeadItem } from '../../../shared/types/workflowTypes';

interface LoanLeadCardProps {
  lead: LeadItem;
  onAssign: (lead: LeadItem) => void;
  onConvert: (lead: LeadItem) => void;
}

export function LoanLeadCard({ lead, onAssign, onConvert }: LoanLeadCardProps) {
  return (
    <div className="tx-lead-card">
      <div className="tx-lead-card-top">
        <span className="tx-lead-id">{lead.id}</span>
        <span className="tx-lead-cat-tag">{lead.category}</span>
        <StatusBadge status={lead.status} />
      </div>

      <h3 className="tx-lead-name">{lead.name}</h3>
      <p className="tx-lead-biz">{lead.business}</p>

      <div className="tx-lead-amount-box">
        <span className="tx-lead-amt-lbl">Requested Capital</span>
        <span className="tx-lead-amt-val">{lead.requestedAmount}</span>
      </div>

      <div className="tx-lead-contact">
        <div className="tx-lead-c-item">
          <Phone size={13} />
          <span>{lead.phone}</span>
        </div>
        <div className="tx-lead-c-item">
          <Mail size={13} />
          <span>{lead.email}</span>
        </div>
      </div>

      <div className="tx-lead-meta-row">
        <span>Bureau Estimate: <strong>{(lead as any).cibilEstimate || (lead as any).cibilScore || 750}+</strong></span>
        <span>Officer: <strong>{lead.assignedOfficer || 'Unassigned'}</strong></span>
      </div>

      <div className="tx-lead-card-footer">
        <button
          type="button"
          className="tx-btn-assign-officer"
          onClick={() => onAssign(lead)}
          title="Assign Credit Officer"
        >
          <UserPlus size={14} />
          <span>Assign</span>
        </button>
        {lead.status !== 'CONVERTED' ? (
          <button
            type="button"
            className="tx-btn-convert-lead"
            onClick={() => onConvert(lead)}
          >
            <span>Convert to Application</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <span className="tx-lead-converted-badge">✓ Converted to File</span>
        )}
      </div>
    </div>
  );
}

export default LoanLeadCard;
