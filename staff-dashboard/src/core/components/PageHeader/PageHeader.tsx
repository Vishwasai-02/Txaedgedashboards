import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumb?: string[] | React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumb, actions, badge }: PageHeaderProps) {
  return (
    <div className="tx-page-header">
      <div className="tx-page-header-content">
        {breadcrumb && (
          <div className="tx-page-header-breadcrumb">
            {Array.isArray(breadcrumb)
              ? breadcrumb.map((crumb, idx) => (
                  <span key={idx} className="tx-breadcrumb-item">
                    {crumb}
                    {idx < breadcrumb.length - 1 && <span className="tx-breadcrumb-separator">/</span>}
                  </span>
                ))
              : breadcrumb}
          </div>
        )}
        <div className="tx-page-header-title-row">
          <h1 className="tx-page-header-title">{title}</h1>
          {badge && <span className="tx-page-header-badge">{badge}</span>}
        </div>
        {subtitle && <p className="tx-page-header-sub">{subtitle}</p>}
      </div>
      {actions && <div className="tx-page-header-actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
