import React from 'react';
import './ApplicationsByServiceChart.css';

export default function ApplicationsByServiceChart({ services = [] }: { services?: any[] }) {
  const getThemeClass = (index: number) => {
    const classes = ['gst', 'itr', 'loan', 'company', 'audit'];
    return classes[index % classes.length];
  };

  const getThemeColor = (index: number) => {
    const colors = ['#083B75', '#0B5ED7', '#F97316', '#16A34A', '#052750'];
    return colors[index % colors.length];
  };

  return (
    <div className="tx-service-chart-card">
      <h3 className="tx-service-chart-title">Applications by Service Portfolio</h3>
      <div className="tx-service-list">
        {services.map((item, idx) => (
          <div key={item.service} className="tx-service-item">
            <div className="tx-service-info">
              <span className="tx-service-name">{item.service}</span>
              <span className="tx-service-stats">
                {item.count.toLocaleString()} cases ({item.percentage}%)
              </span>
            </div>
            <div className="tx-progress-track">
              <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                <rect x="0" y="0" width="100" height="8" rx="4" fill="var(--tx-background)" />
                <rect
                  x="0"
                  y="0"
                  width={item.percentage}
                  height="8"
                  rx="4"
                  fill={getThemeColor(idx)}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
