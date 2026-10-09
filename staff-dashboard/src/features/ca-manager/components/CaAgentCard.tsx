import React from 'react';
import { Star, Eye, MessageSquare, Shuffle, Trash2 } from 'lucide-react';
import { Employee } from '../../../shared/types/workflowTypes';

interface CaAgentCardProps {
  member: Employee & { activeCases: number; completedCases?: number; avgTurnaround?: string; rating?: number };
  maxCapacity?: number;
  onViewDetails: (member: any) => void;
  onMessage: (member: any) => void;
  onRebalance: (member: any) => void;
  onRemove: (member: any) => void;
}

export function CaAgentCard({
  member,
  maxCapacity = 20,
  onViewDetails,
  onMessage,
  onRebalance,
  onRemove
}: CaAgentCardProps) {
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
          <span className="tx-m-lbl">Active Cases</span>
        </div>
        <div className="tx-m-metric">
          <span className="tx-m-val">{member.completedCases || 18}</span>
          <span className="tx-m-lbl">Cleared MTD</span>
        </div>
        <div className="tx-m-metric">
          <span className="tx-m-val">{member.avgTurnaround || '2.4d'}</span>
          <span className="tx-m-lbl">Avg SLA</span>
        </div>
      </div>

      <div className="tx-member-capacity">
        <div className="tx-capacity-label">
          <span>Workload Capacity ({member.activeCases || 0}/{maxCapacity})</span>
          <span>{capacityPercent}%</span>
        </div>
        <div className="tx-capacity-bar">
          <div
            className={`tx-capacity-fill ${capacityPercent > 80 ? 'high' : capacityPercent > 50 ? 'medium' : 'normal'}`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>

      <div className="tx-member-card-footer" style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          className="tx-btn-rebalance"
          onClick={() => onViewDetails(member)}
          title="View complete agent profile and dossier"
          style={{ flex: 1 }}
        >
          <Eye size={14} />
          <span>Details</span>
        </button>
        <button
          type="button"
          className="tx-btn-rebalance"
          onClick={() => onMessage(member)}
          title={`Direct bilateral message with ${member.name}`}
          style={{ flex: 1, backgroundColor: '#ea580c', borderColor: '#ea580c', color: '#ffffff' }}
        >
          <MessageSquare size={14} />
          <span>Message</span>
        </button>
        <button
          type="button"
          className="tx-btn-rebalance"
          onClick={() => onRebalance(member)}
          title="Rebalance Caseload"
          style={{ padding: '0 8px' }}
        >
          <Shuffle size={14} />
        </button>
        <button
          type="button"
          className="tx-btn-rebalance"
          onClick={() => onRemove(member)}
          title={`Remove ${member.name} from department`}
          style={{ padding: '0 8px', color: '#ef4444', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default CaAgentCard;
