import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, PhoneOff, Clock } from 'lucide-react';
import TaskDetailPanel from '../components/TaskDetailPanel';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';
import { agentApi } from '../services/agentApi';
import './TaskDetailPage.css';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const taskId = id || 'TSK-101';

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Call state with live timer
  const [callAlert, setCallAlert] = useState<string | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);

  // Additional doc modal state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docReason, setDocReason] = useState('');
  const [docDueDate, setDocDueDate] = useState('2026-10-15');
  const [docError, setDocError] = useState('');

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('All primary documents verified against statutory registries. Ready for manager sign-off.');
  const [reviewError, setReviewError] = useState('');

  // Certificate modal state
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certType, setCertType] = useState('GST Registration Certificate (REG-06)');
  const [certNumber, setCertNumber] = useState('29AABCD1234F1Z5');
  const [issuedDate, setIssuedDate] = useState('2026-10-02');
  const [certError, setCertError] = useState('');

  const fetchTask = async () => {
    setLoading(true);
    const data = await agentApi.getTaskById(taskId);
    setTask(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTask();
    const unsub = agentApi.subscribe(() => {
      fetchTask();
    });
    return () => {
      if (unsub) unsub();
    };
  }, [taskId]);

  const handleSubmitForReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionNotes.trim() || submissionNotes.trim().length < 5) {
      setReviewError('Please provide submission audit notes (min 5 chars).');
      return;
    }

    await agentApi.submitTaskForReview(taskId, { notes: submissionNotes.trim() });
    setIsReviewModalOpen(false);
    setReviewError('');
    await fetchTask();
    setToast('Case successfully submitted for CA Manager review! Dispatched to audit queue.');
    setTimeout(() => setToast(''), 4500);
  };

  // Live call timer
  useEffect(() => {
    let timer: any;
    if (callActive) {
      timer = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  const handleToggleChecklist = async (checklistId: string) => {
    const updated = await agentApi.toggleChecklistItem(taskId, checklistId);
    setTask({ ...updated });
    setToast('Checklist progress updated.');
    setTimeout(() => setToast(''), 3000);
  };

  const handleCallCustomer = async (phone: string) => {
    const res = await agentApi.triggerMaskedCall(phone);
    setCallAlert(res.message);
    setCallActive(true);
    setCallSeconds(0);
  };

  const handleEndCall = () => {
    setCallActive(false);
    const duration = formatCallTime(callSeconds);
    setCallAlert(null);
    setToast(`Masked customer call concluded. Call duration: ${duration}. Call log recorded.`);
    setTimeout(() => setToast(''), 4500);
  };

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleSendDocRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      setDocError('Please specify the document name.');
      return;
    }
    if (!docReason.trim() || docReason.trim().length < 5) {
      setDocError('Requirement reason must be at least 5 characters long.');
      return;
    }

    await agentApi.requestAdditionalDoc(taskId, {
      name: docName,
      reason: docReason,
      dueDate: docDueDate
    });

    setIsDocModalOpen(false);
    setDocName('');
    setDocReason('');
    setDocError('');
    setToast(`Request for "${docName}" dispatched via Push Notification & WhatsApp to customer.`);
    setTimeout(() => setToast(''), 5000);
  };

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim() || certNumber.trim().length < 5) {
      setCertError('Please specify a valid official registration or certificate number.');
      return;
    }

    await agentApi.uploadCertificate(taskId, {
      certificateType: certType,
      certificateNumber: certNumber,
      issuedDate
    });

    setIsCertModalOpen(false);
    setCertError('');
    fetchTask();
    setToast('Certificate verified & uploaded successfully! Case resolved and customer notified.');
    setTimeout(() => setToast(''), 5000);
  };

  if (loading || !task) {
    return <div className="tx-loading-state">Loading operational task file...</div>;
  }

  return (
    <div className="tx-task-detail-page">
      <div className="tx-task-detail-top-nav">
        <Button variant="secondary" onClick={() => navigate('/agent/tasks')}>
          ← Back to Task Queue
        </Button>
      </div>

      {toast && (
        <div className="tx-task-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {callAlert && (
        <div className="tx-call-banner">
          <div className="tx-call-banner-left">
            <span className="tx-call-pulse-dot" />
            <span>📞 {callAlert}</span>
            {callActive && (
              <span className="tx-call-timer">
                <Clock size={13} /> {formatCallTime(callSeconds)}
              </span>
            )}
          </div>
          <button
            type="button"
            className="tx-btn-end-call"
            onClick={handleEndCall}
          >
            <PhoneOff size={14} />
            <span>End Call</span>
          </button>
        </div>
      )}

      <TaskDetailPanel
        task={task}
        onToggleChecklist={handleToggleChecklist}
        onCallCustomer={handleCallCustomer}
        onRequestAdditionalDoc={() => {
          setDocError('');
          setIsDocModalOpen(true);
        }}
        onOpenUploadCert={() => {
          setCertError('');
          setIsCertModalOpen(true);
        }}
        onSubmitForReview={() => {
          setReviewError('');
          setIsReviewModalOpen(true);
        }}
      />

      {/* Submit for Manager Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Submit Work for Manager Audit & Review"
      >
        <form className="tx-modal-form-grid" onSubmit={handleSubmitForReview}>
          {reviewError && (
            <div className="tx-modal-error-banner">
              <AlertTriangle size={14} />
              <span>{reviewError}</span>
            </div>
          )}

          <p style={{ fontSize: '13px', color: '#4B5563', margin: '0 0 14px 0' }}>
            Submit case <strong>{task.service}</strong> ({task.customerName}) to CA Manager (Sanjay Verma) for final compliance sign-off.
          </p>

          <div className="tx-form-field-item">
            <label className="tx-form-field-label">Agent Audit &amp; Computation Notes *</label>
            <textarea
              className="tx-form-field-textarea"
              rows={3}
              placeholder="Detail reconciliation notes, challans paid, or compliance confirmations..."
              value={submissionNotes}
              onChange={(e) => {
                setSubmissionNotes(e.target.value);
                if (reviewError) setReviewError('');
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Case for Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Additional Document Modal */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Request Additional Customer Document"
      >
        <form className="tx-modal-form-grid" onSubmit={handleSendDocRequest}>
          {docError && (
            <div className="tx-modal-error-banner">
              <AlertTriangle size={14} />
              <span>{docError}</span>
            </div>
          )}

          <div className="tx-form-field-item">
            <label className="tx-form-field-label">Document Name *</label>
            <input
              type="text"
              className="tx-form-field-input"
              placeholder="e.g. Latest Electricity Bill / NOC from Landlord"
              value={docName}
              onChange={(e) => {
                setDocName(e.target.value);
                if (docError) setDocError('');
              }}
              required
            />
          </div>
          <div className="tx-form-field-item">
            <label className="tx-form-field-label">Reason for Requirement (Min 5 chars) *</label>
            <textarea
              className="tx-form-field-textarea"
              placeholder="Reason explaining why the portal or tax officer rejected previous submission..."
              value={docReason}
              onChange={(e) => {
                setDocReason(e.target.value);
                if (docError) setDocError('');
              }}
              required
            />
          </div>
          <div className="tx-form-field-item">
            <label className="tx-form-field-label">Customer Submission Deadline</label>
            <input
              type="date"
              className="tx-form-field-input"
              value={docDueDate}
              onChange={(e) => setDocDueDate(e.target.value)}
              required
            />
          </div>
          <div className="tx-picker-footer">
            <Button variant="secondary" onClick={() => setIsDocModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              Dispatch Request to WhatsApp &amp; App
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Certificate Modal */}
      <Modal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        title="Upload Verified Government Certificate"
      >
        <form className="tx-modal-form-grid" onSubmit={handleUploadCertificate}>
          {certError && (
            <div className="tx-modal-error-banner">
              <AlertTriangle size={14} />
              <span>{certError}</span>
            </div>
          )}

          <div className="tx-form-field-item">
            <label className="tx-form-field-label">Certificate / Order Type *</label>
            <input
              type="text"
              className="tx-form-field-input"
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              required
            />
          </div>
          <div className="tx-form-field-item">
            <label className="tx-form-field-label">Official Certificate / Reg Number *</label>
            <input
              type="text"
              className="tx-form-field-input"
              value={certNumber}
              onChange={(e) => {
                setCertNumber(e.target.value);
                if (certError) setCertError('');
              }}
              required
            />
          </div>
          <div className="tx-form-field-item">
            <label className="tx-form-field-label">Issue Date</label>
            <input
              type="date"
              className="tx-form-field-input"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              required
            />
          </div>
          <div className="tx-picker-footer">
            <Button variant="secondary" onClick={() => setIsCertModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              Publish Certificate &amp; Close Case
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
