import React from 'react';
import { CheckCircle2, Clock, FileText, AlertCircle, User, ArrowRight } from 'lucide-react';
import './ActivityTimeline.css';

export interface TimelineItem {
  id?: string;
  type?: string;
  title: string;
  timestamp: string;
  description?: string;
  user?: string;
}

export interface ActivityTimelineProps {
  items?: TimelineItem[];
}

export function ActivityTimeline({ items = [] }: ActivityTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="tx-timeline-empty">
        <p>No recent activity recorded.</p>
      </div>
    );
  }

  const getTimelineIcon = (type?: string) => {
    switch (type) {
      case 'approved':
      case 'completed':
        return <CheckCircle2 size={14} className="tx-tl-icon-success" />;
      case 'rejected':
      case 'rework':
        return <AlertCircle size={14} className="tx-tl-icon-danger" />;
      case 'document':
        return <FileText size={14} className="tx-tl-icon-info" />;
      case 'user':
        return <User size={14} className="tx-tl-icon-warning" />;
      default:
        return <Clock size={14} className="tx-tl-icon-default" />;
    }
  };

  return (
    <div className="tx-timeline">
      {items.map((item, index) => (
        <div key={item.id || index} className="tx-timeline-item">
          <div className="tx-timeline-point">
            <span className="tx-timeline-icon-wrap">{getTimelineIcon(item.type)}</span>
            {index < items.length - 1 && <span className="tx-timeline-line" />}
          </div>
          <div className="tx-timeline-body">
            <div className="tx-timeline-header">
              <span className="tx-timeline-title">{item.title}</span>
              <span className="tx-timeline-time">{item.timestamp}</span>
            </div>
            {item.description && <p className="tx-timeline-desc">{item.description}</p>}
            {item.user && (
              <div className="tx-timeline-user">
                <span className="tx-timeline-user-label">By:</span>
                <span className="tx-timeline-user-name">{item.user}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityTimeline;
