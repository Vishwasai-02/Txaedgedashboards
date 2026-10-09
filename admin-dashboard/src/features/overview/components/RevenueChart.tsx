import React from 'react';
import './RevenueChart.css';

export default function RevenueChart({ trends = [] }: { trends?: any[] }) {
  const maxVal = Math.max(...trends.flatMap((t: any) => [t.revenue || 0, t.target || 0]), 800000);
  const chartHeight = 180;
  const barWidth = 18;
  const gap = 8;
  const groupWidth = barWidth * 2 + gap;

  return (
    <div className="tx-revenue-chart-card">
      <div className="tx-chart-header">
        <h3 className="tx-chart-title">Revenue Trends &amp; Targets (FY 2026-27)</h3>
        <div className="tx-chart-legend">
          <div className="tx-legend-item">
            <span className="tx-legend-dot revenue" />
            <span>Actual Revenue</span>
          </div>
          <div className="tx-legend-item">
            <span className="tx-legend-dot target" />
            <span>Target</span>
          </div>
        </div>
      </div>

      <svg
        className="tx-chart-svg"
        viewBox={`0 0 ${trends.length * 100} 220`}
        width="100%"
        height="220"
      >
        {/* Horizontal gridlines */}
        <line x1="0" y1="20" x2={trends.length * 100} y2="20" stroke="var(--tx-border)" strokeDasharray="3 3" />
        <line x1="0" y1="75" x2={trends.length * 100} y2="75" stroke="var(--tx-border)" strokeDasharray="3 3" />
        <line x1="0" y1="130" x2={trends.length * 100} y2="130" stroke="var(--tx-border)" strokeDasharray="3 3" />
        <line x1="0" y1="185" x2={trends.length * 100} y2="185" stroke="var(--tx-border)" />

        {trends.map((item: any, idx: number) => {
          const revHeight = (item.revenue / maxVal) * chartHeight;
          const targetHeight = (item.target / maxVal) * chartHeight;
          const groupX = idx * 100 + (100 - groupWidth) / 2;

          return (
            <g key={item.month}>
              {/* Actual revenue bar */}
              <rect
                x={groupX}
                y={185 - revHeight}
                width={barWidth}
                height={revHeight}
                rx="4"
                fill="var(--tx-primary-navy)"
              >
                <title>{`${item.month} Revenue: ₹${item.revenue.toLocaleString('en-IN')}`}</title>
              </rect>

              {/* Target bar */}
              <rect
                x={groupX + barWidth + gap}
                y={185 - targetHeight}
                width={barWidth}
                height={targetHeight}
                rx="4"
                fill="var(--tx-primary-orange)"
              >
                <title>{`${item.month} Target: ₹${item.target.toLocaleString('en-IN')}`}</title>
              </rect>

              {/* Month label */}
              <text
                x={groupX + groupWidth / 2}
                y="205"
                textAnchor="middle"
                fontSize="12"
                fill="var(--tx-secondary-text)"
                fontWeight="500"
              >
                {item.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
