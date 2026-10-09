import React from 'react';
import { PhoneCall, FilePlus, UploadCloud, CheckCircle, Send, Clock, AlertTriangle } from 'lucide-react';
import Button from '../../../core/components/Button/Button';
import './TaskDetailPanel.css';

export interface TaskDetailPanelProps {
  task: any;
  onToggleChecklist?: (checklistId: string) => void;
  onCallCustomer?: (phone: string) => void;
  onRequestAdditionalDoc?: () => void;
  onOpenUploadCert?: () => void;
  onSubmitForReview?: () => void;
}

export default function TaskDetailPanel({
  task,
  onToggleChecklist = () => {},
  onCallCustomer = () => {},
  onRequestAdditionalDoc = () => {},
  onOpenUploadCert = () => {},
  onSubmitForReview = () => {}
}: TaskDetailPanelProps) {
  if (!task) return null;

  return (
    <div className="tx-task-panel">
      <div className="tx-task-card-header">
        <div className="tx-task-meta-left">
          <div className="tx-task-id-title">
            <span className="tx-app-id-badge">{task.applicationId}</span>
            <span className="tx-task-id-badge">{task.id}</span>
            <h2 className="tx-task-title-text">{task.service}</h2>
            <span className={`tx-task-status ${(task.status || 'PENDING').toLowerCase()}`}>
              {(task.status || 'PENDING').replace(/_/g, ' ')}
            </span>
          </div>
          <div className="tx-customer-sub">
            Client: <strong>{task.customerName}</strong> ({task.customerPhone}) • Deadline: <strong>{task.deadline || task.dueDate}</strong>
          </div>
        </div>

        <div className="tx-task-actions-right">
          <Button
            variant="secondary"
            icon={<PhoneCall size={16} />}
            onClick={() => onCallCustomer(task.customerPhone)}
            title="Caller ID: TANVOX (Masked)"
          >
            Call Client
          </Button>
          <Button
            variant="secondary"
            icon={<FilePlus size={16} />}
            onClick={onRequestAdditionalDoc}
          >
            Request Add'l Doc
          </Button>

          {task.status !== 'COMPLETED' && task.status !== 'PENDING_REVIEW' && (
            <Button
              variant="primary"
              icon={<Send size={16} />}
              onClick={onSubmitForReview}
            >
              {task.status === 'REWORK_REQUIRED' ? 'Resubmit for Review' : 'Submit for Review'}
            </Button>
          )}

          {task.status === 'PENDING_REVIEW' && (
            <Button variant="secondary" disabled icon={<Clock size={16} />}>
              Under Manager Review
            </Button>
          )}

          <Button
            variant="orange"
            icon={<UploadCloud size={16} />}
            onClick={onOpenUploadCert}
          >
            Upload Certificate
          </Button>
        </div>
      </div>

      {/* Rework Required Alert Banner */}
      {task.status === 'REWORK_REQUIRED' && task.reviewRemarks && (
        <div
          style={{
            background: '#FFF1F2',
            border: '1px solid #F43F5E',
            borderRadius: '8px',
            padding: '12px 16px',
            margin: '14px 0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}
        >
          <AlertTriangle size={18} color="#E11D48" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#BE123C', fontSize: '13px' }}>
              CA Manager Audit Feedback — Corrections Required:
            </strong>
            <p style={{ margin: '4px 0 0 0', color: '#881337', fontSize: '13px' }}>
              {task.reviewRemarks}
            </p>
          </div>
        </div>
      )}

      {/* Pending Review Banner */}
      {task.status === 'PENDING_REVIEW' && (
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #3B82F6',
            borderRadius: '8px',
            padding: '12px 16px',
            margin: '14px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Clock size={18} color="#2563EB" />
          <span style={{ color: '#1E40AF', fontSize: '13px', fontWeight: 500 }}>
            Filing submitted to CA Manager (Sanjay Verma) for statutory audit and review.
          </span>
        </div>
      )}

      <div className="tx-task-split-view">
        <div className="tx-checklist-card">
          <h3 className="tx-card-heading">
            Operational Workflow &amp; Sub-Checklist (Application-Centric)
          </h3>
          <div className="tx-instructions-box">
            <strong>Manager Instructions:</strong> {task.instructions || 'Verify documents and prepare return.'}
          </div>

          <div className="tx-checklist-items">
            {task.checklist && task.checklist.map((item: any) => (
              <div
                key={item.id}
                className={`tx-check-item ${item.completed ? 'done' : ''}`}
                onClick={() => onToggleChecklist(item.id)}
              >
                <input
                  type="checkbox"
                  className="tx-check-checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                />
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tx-cert-card">
          <h3 className="tx-card-heading">Certificate &amp; Final Outcome</h3>
          {task.certificate ? (
            <div className="tx-cert-info-grid">
              <div>
                <div className="tx-cert-label">Certificate ID:</div>
                <div className="tx-cert-value">{task.certificate.id}</div>
              </div>
              <div>
                <div className="tx-cert-label">Certificate No:</div>
                <div className="tx-cert-value">{task.certificate.certificateNumber}</div>
              </div>
              <div>
                <div className="tx-cert-label">Type:</div>
                <div className="tx-cert-value">{task.certificate.certificateType}</div>
              </div>
              <div>
                <div className="tx-cert-label">Status:</div>
                <div className="tx-cert-status-verified">
                  ✓ {task.certificate.status}
                </div>
              </div>
            </div>
          ) : (
            <p className="tx-muted-text">
              No final certificate or acknowledgment uploaded yet. Complete your checklist and
              submit the filing for CA Manager sign-off.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
