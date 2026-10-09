import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw } from 'lucide-react';
import './ErrorBoundary.css';

declare global {
  interface Window {
    taxedgeResetStore?: () => void;
  }
}

export interface ErrorBoundaryProps {
  children: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TaxEdge Staff Dashboard ErrorBoundary caught an exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndRecover = () => {
    try {
      if (typeof window.taxedgeResetStore === 'function') {
        window.taxedgeResetStore();
      }
      localStorage.removeItem('taxedge_staff_user');
      localStorage.removeItem('taxedge_staff_token');
    } catch (e) {
      console.warn('Reset error:', e);
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="tx-error-boundary-screen">
          <div className="tx-error-boundary-card">
            <div className="tx-error-icon-box">
              <AlertTriangle size={36} />
            </div>
            <h2 className="tx-error-title">Workspace Recovery Encountered an Issue</h2>
            <p className="tx-error-subtitle">
              An unexpected error occurred while rendering this view. Your session and operational data are safe.
            </p>

            {this.state.error && (
              <div className="tx-error-details-box">
                <code>{this.state.error.toString()}</code>
              </div>
            )}

            <div className="tx-error-actions">
              <button
                type="button"
                className="tx-btn-error-primary"
                onClick={this.handleReload}
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                className="tx-btn-error-secondary"
                onClick={this.handleResetAndRecover}
              >
                <RotateCcw size={16} />
                <span>Reset to Defaults</span>
              </button>
              <a href="/login" className="tx-btn-error-link">
                <Home size={16} />
                <span>Return to Login</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
