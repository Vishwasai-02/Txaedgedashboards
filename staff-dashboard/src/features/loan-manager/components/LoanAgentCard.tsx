import React from 'react';
import { Star, Eye, MessageSquare, Shuffle, Trash2 } from 'lucide-react';
import { Employee } from '../../../shared/types/workflowTypes';

interface LoanAgentCardProps {
  member: Employee & { activeCases: number; completedMonth?: number; avgResolutionDays?: string; rating?: number };
  maxCapacity?: number;
  onViewDetails: (member: any) => void;
  onMessage: (member: any) => void;
  onRebalance: (member: any) => void;
  onRemove: (member: any) => void;
}

export function LoanAgentCard({
  member,
  maxCapacity = 15,
  onViewDetails,
  onMessage,
  onRebalance,
  onRemove
}: LoanAgentCardProps) {
  const capacityPercent = Math.min(100, Math.round(((member.activeCases || 0) / maxCapacity) * 100));

  return (
    <div className="tx-member-card">
      <div className="tx-member-header">
        <div className="tx-member-avatar">
          {member.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="tx-member-info">
          <h3 className="tx-member-name">{member.name}</h3>
          <span className="tx-member-role">{member.role}</span>
        </div>
        <div className="tx-member-rating">
          <Star size={14} className="tx-star-icon" />
          <span>{member.rating || 4.8}</span>
        </div>
      </div>

      <div className="tx-member-metrics">
        <div className="tx-m-metric">
          <span className="tx-m-val">{member.activeCases || 0}</span>
          <span className="tx-m-lbl">Active Loans</span>
        </div>
        <div className="tx-m-metric">
          <span className="tx-m-val">{member.completedMonth || 15}</span>
          <span className="tx-m-lbl">Sanctioned MTD</span>
        </div>
        <div className="tx-m-metric">
          <span className="tx-m-val">{member.avgResolutionDays || '3.2d'}</span>
          <span className="tx-m-lbl">Avg SLA</span>
        </div>
      </div>

      <div className="tx-member-capacity">
        <div className="tx-capacity-label">
          <span>Credit Load ({member.activeCases || 0}/{maxCapacity})</span>
          <span>{capacityPercent}%</span>
        </div>
        <div className="tx-capacity-bar">
          <div
            className={`tx-capacity-fill ${capacityPercent > 80 ? 'high' : capacityPercent > 50 ? 'medium' : 'normal'}`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>

      <div className="tx-member-card-footer">
        <button
          type="button"
          className="tx-btn-card-action primary-outline"
          onClick={() => onViewDetails(member)}
          title="View complete agent profile and dossier"
        >
          <Eye size={14} />
          <span>Details</span>
        </button>
        <button
          type="button"
          className="tx-btn-card-action primary-fill"
          onClick={() => onMessage(member)}
          title={`Direct bilateral message with ${member.name}`}
        >
          <MessageSquare size={14} />
          <span>Message</span>
        </button>
        <button
          type="button"
          className="tx-btn-icon-action"
          onClick={() => onRebalance(member)}
          title="Rebalance Caseload"
        >
          <Shuffle size={14} />
        </button>
        <button
          type="button"
          className="tx-btn-icon-action danger"
          onClick={() => onRemove(member)}
          title={`Remove ${member.name} from department`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default LoanAgentCard;
