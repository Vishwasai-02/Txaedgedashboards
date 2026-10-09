import React from 'react';
import './SummaryCard.css';

export interface SummaryCardProps {
  title: React.ReactNode;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  icon?: React.ReactNode;
  iconTheme?: string;
  trend?: React.ReactNode;
  trendDirection?: 'up' | 'down' | 'flat' | string;
  onClick?: () => void;
}

export default function SummaryCard({
  title,
  value,
  subtext,
  icon,
  iconTheme = 'blue',
  trend = null,
  trendDirection = 'up',
  onClick
}: SummaryCardProps) {
  return (
    <div
      className="tx-summary-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="tx-summary-card-header">
        <span className="tx-summary-card-title">{title}</span>
        {icon && (
          <div className={`tx-summary-card-icon ${iconTheme}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="tx-summary-card-body">
        <span className="tx-summary-card-value">{value}</span>
        {trend && (
          <span className={`tx-summary-card-trend ${trendDirection}`}>
            {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '•'} {trend}
          </span>
        )}
      </div>

      {subtext && <span className="tx-summary-card-subtext">{subtext}</span>}
    </div>
  );
}
