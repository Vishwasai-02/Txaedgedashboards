import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  X,
  Plus,
  ChevronDown,
  Filter,
  Check
} from 'lucide-react';
import ApplicationsTable from '../components/ApplicationsTable';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import Button from '../../../core/components/Button/Button';
import { applicationsApi } from '../services/applicationsApi';
import { APPLICATION_STATUS, PAYMENT_STATUS } from '../../../core/constants/statusEnums';
import { ApplicationItem } from '../../../shared/types/workflowTypes';
import ApplicationDetailModal from '../components/ApplicationDetailModal';
import ApplicationIngestModal from '../components/ApplicationIngestModal';
import './ApplicationsPage.css';

const DEFAULT_DOC_CHECKLIST = [
  { name: 'PAN Card Copy', verified: true, file: 'pan_card_doc.pdf' },
  { name: 'Aadhaar / Passport KYC', verified: true, file: 'aadhaar_front_back.pdf' },
  { name: 'Proof of Business Address / Electricity Bill', verified: false, file: 'ebill_latest.pdf' },
  { name: 'Cancelled Bank Cheque', verified: true, file: 'bank_cheque_cancelled.jpg' },
];

export const SERVICE_OPTIONS = [
  { id: 'ALL', label: 'All Services' },
  { id: 'GST', label: 'GST' },
  { id: 'ITR', label: 'ITR' },
  { id: 'LOANS', label: 'Loans' },
  { id: 'INCORPORATION', label: 'Incorporation' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedService, setSelectedService] = useState('ALL');
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [docChecklist, setDocChecklist] = useState(DEFAULT_DOC_CHECKLIST);

  // Ingestion Modal State
  const [ingestModalOpen, setIngestModalOpen] = useState(false);
  const [ingestForm, setIngestForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    service: 'GST New Registration',
    domain: 'CA',
    amount: '2499',
    priority: 'NORMAL',
    assignedExecutive: 'Suresh Kumar'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: string;
    targetStatus: string | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'primary',
    targetStatus: null
  });

  // User Feedback Toast
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const loadApplications = () => {
    applicationsApi.getApplications().then((data) => {
      setApplications(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    loadApplications();
    const unsub = applicationsApi.subscribe(() => loadApplications());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target as Node)
      ) {
        setServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const openAppDetail = (app: ApplicationItem) => {
    setSelectedApp(app);
    setDocChecklist(
      DEFAULT_DOC_CHECKLIST.map((doc, idx) => ({
        ...doc,
        verified: idx % 2 === 0
      }))
    );
    setDetailModalOpen(true);
  };

  const toggleDocVerify = (idx: number) => {
    const updated = [...docChecklist];
    updated[idx].verified = !updated[idx].verified;
    setDocChecklist(updated);
    showToast(`Verification status updated for ${updated[idx].name}.`, 'info');
  };

  const promptStatusChange = (newStatus: string) => {
    if (!selectedApp) return;

    if (newStatus === APPLICATION_STATUS.REJECTED) {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Case Rejection',
        message: `Are you sure you want to reject application ${selectedApp.id}? This will flag the filing and notify the client.`,
        variant: 'danger',
        targetStatus: newStatus
      });
    } else if (newStatus === APPLICATION_STATUS.COMPLETED) {
      setConfirmModal({
        isOpen: true,
        title: 'Finalize & Complete Application',
        message: `Mark application ${selectedApp.id} as fully completed and delivered?`,
        variant: 'primary',
        targetStatus: newStatus
      });
    } else {
      executeStatusUpdate(newStatus);
    }
  };

  const executeStatusUpdate = async (newStatus: string | null) => {
    if (!selectedApp || !newStatus) return;
    await applicationsApi.updateStatus(selectedApp.id, newStatus);
    setSelectedApp({ ...selectedApp, status: newStatus });
    setConfirmModal({ ...confirmModal, isOpen: false });
    showToast(`Application ${selectedApp.id} status updated to ${newStatus}.`, 'success');
  };

  const validateIngestForm = () => {
    const errors: Record<string, string> = {};
    if (!ingestForm.customerName.trim() || ingestForm.customerName.trim().length < 3) {
      errors.customerName = 'Client/Entity name must be at least 3 characters.';
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(ingestForm.customerPhone.trim())) {
      errors.customerPhone = 'Enter a valid 10-digit mobile number.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (ingestForm.customerEmail && !emailRegex.test(ingestForm.customerEmail.trim())) {
      errors.customerEmail = 'Enter a valid email address.';
    }
    if (!ingestForm.amount || Number(ingestForm.amount) <= 0) {
      errors.amount = 'Fee amount must be greater than zero.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIngestForm()) return;

    const newApp = {
      id: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: ingestForm.customerName.trim(),
      customerPhone: ingestForm.customerPhone.trim(),
      customerEmail: ingestForm.customerEmail.trim() || 'client@example.com',
      service: ingestForm.service,
      domain: ingestForm.domain,
      submittedDate: new Date().toISOString().split('T')[0],
      documentsCount: '3 / 4 Docs',
      paymentStatus: PAYMENT_STATUS.PENDING,
      assignedExecutive: ingestForm.assignedExecutive,
      priority: ingestForm.priority,
      status: APPLICATION_STATUS.PROCESSING,
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
    };

    await applicationsApi.createApplication(newApp);
    setIngestModalOpen(false);
    setIngestForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      service: 'GST New Registration',
      domain: 'CA',
      amount: '2499',
      priority: 'NORMAL',
      assignedExecutive: 'Suresh Kumar'
    });
    setFormErrors({});
    showToast(`New application ${newApp.id} ingested successfully!`, 'success');
  };

  const matchesService = (app: any, serviceKey: string) => {
    if (!serviceKey || serviceKey === 'ALL') return true;

    const serviceStr = (app.service || app.serviceName || app.loanType || '').toLowerCase();
    const domainStr = (app.domain || '').toUpperCase();
    const categoryStr = (app.category || '').toLowerCase();
    const idStr = (app.id || '').toLowerCase();

    switch (serviceKey) {
      case 'GST':
        return serviceStr.includes('gst') || categoryStr.includes('indirect tax');
      case 'ITR':
        return (
          serviceStr.includes('itr') ||
          serviceStr.includes('income tax') ||
          categoryStr.includes('direct tax')
        );
      case 'LOANS':
        return (
          serviceStr.includes('loan') ||
          domainStr === 'LOAN' ||
          categoryStr.includes('loan') ||
          idStr.startsWith('ln-') ||
          Boolean(app.loanType)
        );
      case 'INCORPORATION':
        return (
          serviceStr.includes('incorporation') ||
          serviceStr.includes('llp') ||
          serviceStr.includes('roc') ||
          serviceStr.includes('company') ||
          serviceStr.includes('mca')
        );
      default:
        return true;
    }
  };

  const serviceFilteredApplications = applications.filter((app) =>
    matchesService(app, selectedService)
  );

  const filteredApplications = serviceFilteredApplications.filter((app) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PROCESSING') {
      return (
        app.status === APPLICATION_STATUS.PROCESSING ||
        app.status === APPLICATION_STATUS.EXTERNAL_PROCESSING
      );
    }
    if (selectedFilter === 'PAYMENT_PENDING') {
      return app.paymentStatus === PAYMENT_STATUS.PENDING;
    }
    if (selectedFilter === 'DOCUMENTS_REQUIRED') {
      return (
        app.status === APPLICATION_STATUS.ADDITIONAL_DOCUMENT_REQUIRED ||
        app.status === APPLICATION_STATUS.DOCUMENTS_PENDING
      );
    }
    if (selectedFilter === 'COMPLETED') {
      return app.status === APPLICATION_STATUS.COMPLETED;
    }
    return true;
  });

  return (
    <div className="tx-apps-page">
      {feedback && (
        <div className={`tx-apps-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-apps-header">
        <div className="tx-apps-title">
          <h2>Application Master Tracking</h2>
          <p>
            Central monitoring of all customer filings across GST, Income Tax, Corporate Advisory,
            and Loans
          </p>
        </div>
        <Button
          variant="orange"
          icon={<Plus size={18} />}
          onClick={() => {
            setFormErrors({});
            setIngestModalOpen(true);
          }}
        >
          Ingest New Application
        </Button>
      </div>

      <div className="tx-apps-filters">
        <div className="tx-status-filters-group">
          <button
            type="button"
            className={`tx-filter-btn ${selectedFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('ALL')}
          >
            All Applications ({serviceFilteredApplications.length})
          </button>
          <button
            type="button"
            className={`tx-filter-btn ${selectedFilter === 'PROCESSING' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('PROCESSING')}
          >
            In Processing
          </button>
          <button
            type="button"
            className={`tx-filter-btn ${selectedFilter === 'PAYMENT_PENDING' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('PAYMENT_PENDING')}
          >
            Payment Pending
          </button>
          <button
            type="button"
            className={`tx-filter-btn ${selectedFilter === 'DOCUMENTS_REQUIRED' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('DOCUMENTS_REQUIRED')}
          >
            Action Required
          </button>
          <button
            type="button"
            className={`tx-filter-btn ${selectedFilter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('COMPLETED')}
          >
            Completed
          </button>
        </div>

        <div className="tx-service-dropdown-container" ref={serviceDropdownRef}>
          <button
            type="button"
            className={`tx-service-dropdown-btn ${selectedService !== 'ALL' ? 'active' : ''}`}
            onClick={() => setServiceDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={serviceDropdownOpen}
            aria-label="Filter applications by service"
            title="Filter by service"
          >
            <Filter size={14} className="tx-service-filter-icon" />
            <span className="tx-service-dropdown-label">
              {SERVICE_OPTIONS.find((s) => s.id === selectedService)?.label || 'All Services'}
            </span>
            <ChevronDown
              size={14}
              className={`tx-service-dropdown-arrow ${serviceDropdownOpen ? 'open' : ''}`}
            />
          </button>

          <select
            className="tx-service-hidden-select"
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setServiceDropdownOpen(false);
            }}
            aria-label="Filter applications by service"
            tabIndex={-1}
          >
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {serviceDropdownOpen && (
            <ul className="tx-service-dropdown-menu" role="listbox">
              {SERVICE_OPTIONS.map((opt) => (
                <li
                  key={opt.id}
                  role="option"
                  aria-selected={selectedService === opt.id}
                  className={`tx-service-dropdown-item ${
                    selectedService === opt.id ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedService(opt.id);
                    setServiceDropdownOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {selectedService === opt.id && (
                    <Check size={14} className="tx-service-check-icon" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ApplicationsTable
        applications={filteredApplications}
        loading={loading}
        onViewDetail={openAppDetail}
        emptyMessage={
          selectedService !== 'ALL'
            ? 'No applications found for the selected service.'
            : 'No applications found'
        }
      />

      <ApplicationDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        selectedApp={selectedApp}
        docChecklist={docChecklist}
        toggleDocVerify={toggleDocVerify}
        promptStatusChange={promptStatusChange}
      />

      <ApplicationIngestModal
        isOpen={ingestModalOpen}
        onClose={() => setIngestModalOpen(false)}
        form={ingestForm}
        setForm={setIngestForm}
        errors={formErrors}
        onSubmit={handleIngestSubmit}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => executeStatusUpdate(confirmModal.targetStatus)}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText="Confirm Transition"
      />
    </div>
  );
}
