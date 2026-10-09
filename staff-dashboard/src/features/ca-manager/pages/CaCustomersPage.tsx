import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, Phone, Mail, FileText, ArrowRight, CheckCircle2, X } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import Modal from '../../../core/components/Modal/Modal';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import Button from '../../../core/components/Button/Button';
import { caManagerApi } from '../services/caManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import './CaCustomersPage.css';

export default function CaCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    pan: '',
    contact: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadData = () => {
    caManagerApi.getCustomers().then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    const unsubscribe = caManagerApi.subscribe(STORAGE_KEYS.CUSTOMERS, () => {
      loadData();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredCustomers = customers.filter((c: any) => {
    const q = search.toLowerCase();
    return (
      (c.name?.toLowerCase() || '').includes(q) ||
      (c.gstin?.toLowerCase() || '').includes(q) ||
      (c.pan?.toLowerCase() || '').includes(q)
    );
  });

  const handleOpenDetail = (cust: any) => {
    setSelectedCust(cust);
    setDetailModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = 'Client or Business Name must be at least 3 characters.';
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.pan.trim().toUpperCase())) {
      errors.pan = 'Enter a valid 10-character PAN (e.g. ABCDE1234F).';
    }
    if (formData.gstin.trim() && formData.gstin.trim().length !== 15) {
      errors.gstin = 'GSTIN must be 15 alphanumeric characters.';
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.contact.replace(/[^0-9]/g, ''))) {
      errors.contact = 'Enter a valid 10-digit mobile number.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid corporate email address.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newCust = {
      name: formData.name.trim(),
      businessName: formData.name.trim(),
      gstin: formData.gstin.trim().toUpperCase() || '27AAACG0000A1Z5',
      pan: formData.pan.trim().toUpperCase(),
      phone: formData.contact.trim(),
      email: formData.email.trim(),
      activeFilings: 1,
      totalFilings: 1,
      kycStatus: 'VERIFIED',
      status: 'ACTIVE'
    };

    await caManagerApi.addCustomer(newCust);
    loadData();
    setAddModalOpen(false);
    setFormData({ name: '', gstin: '', pan: '', contact: '', email: '' });
    setFormErrors({});
    showToast(`Client account for "${newCust.name}" onboarded to CA portfolio!`, 'success');
  };

  return (
    <div className="tx-ca-customers-page">
      {feedback && (
        <div className={`tx-ca-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <PageHeader
        title="Client Portfolio & Compliance Accounts"
        subtitle="Manage assigned corporate, partnership, and individual clients under CA jurisdiction"
        breadcrumb={['CA Domain', 'Clients', 'Portfolio']}
        actions={
          <button
            type="button"
            className="tx-btn-add-client"
            onClick={() => {
              setFormErrors({});
              setAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Onboard New Client</span>
          </button>
        }
      />

      <div className="tx-customers-controls">
        <div className="tx-cust-search-box">
          <Search size={16} className="tx-search-icon" />
          <input
            type="text"
            placeholder="Search by Business Name, GSTIN, or PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="tx-clear-search-btn"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="tx-cust-counter">
          <span>{filteredCustomers.length} Active Accounts</span>
        </div>
      </div>

      <div className="tx-customers-grid">
        {filteredCustomers.length === 0 ? (
          <div className="tx-customers-empty">
            <Building2 size={36} color="var(--tx-muted-text)" />
            <p>No client accounts match your search filter.</p>
            <button
              type="button"
              className="tx-btn-link-action"
              onClick={() => setSearch('')}
            >
              Clear search query
            </button>
          </div>
        ) : (
          filteredCustomers.map((cust: any) => (
            <div key={cust.id} className="tx-cust-card">
              <div className="tx-cust-card-top">
                <div className="tx-cust-avatar">
                  <Building2 size={20} />
                </div>
                <div className="tx-cust-title-wrap">
                  <h3 className="tx-cust-name">{cust.name}</h3>
                  <span className="tx-cust-id">{cust.id}</span>
                </div>
                <StatusBadge status={cust.status} />
              </div>

              <div className="tx-cust-tax-ids">
                <div className="tx-tax-id-chip">
                  <span className="tx-id-lbl">GSTIN:</span>
                  <span className="tx-id-val">{cust.gstin}</span>
                </div>
                <div className="tx-tax-id-chip">
                  <span className="tx-id-lbl">PAN:</span>
                  <span className="tx-id-val">{cust.pan}</span>
                </div>
              </div>

              <div className="tx-cust-contact-info">
                <div className="tx-contact-row">
                  <Phone size={13} />
                  <span>{cust.contact}</span>
                </div>
                <div className="tx-contact-row">
                  <Mail size={13} />
                  <span>{cust.email}</span>
                </div>
              </div>

              <div className="tx-cust-filings-metric">
                <div className="tx-f-metric">
                  <span className="tx-f-count">{cust.activeFilings || 1}</span>
                  <span className="tx-f-lbl">Active Filings</span>
                </div>
                <div className="tx-f-divider" />
                <div className="tx-f-metric">
                  <span className="tx-f-count">{cust.totalFilings || 3}</span>
                  <span className="tx-f-lbl">Lifetime Cases</span>
                </div>
              </div>

              <div className="tx-cust-card-footer">
                <button
                  type="button"
                  className="tx-btn-view-client"
                  onClick={() => handleOpenDetail(cust)}
                >
                  <span>Inspect Client Dossier</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Onboard Client Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Onboard New CA Client Entity"
      >
        <form onSubmit={handleAddSubmit} className="tx-ca-form">
          <div className="tx-ca-form-group">
            <label>Business / Legal Entity Name *</label>
            <input
              type="text"
              className={`tx-input ${formErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Apex Industrial Solutions Ltd"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <span className="tx-error-text">{formErrors.name}</span>}
          </div>

          <div className="tx-ca-form-row">
            <div className="tx-ca-form-group">
              <label>PAN Card Number *</label>
              <input
                type="text"
                maxLength={10}
                className={`tx-input ${formErrors.pan ? 'is-invalid' : ''}`}
                placeholder="ABCDE1234F"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
              />
              {formErrors.pan && <span className="tx-error-text">{formErrors.pan}</span>}
            </div>

            <div className="tx-ca-form-group">
              <label>GSTIN (15 chars)</label>
              <input
                type="text"
                maxLength={15}
                className={`tx-input ${formErrors.gstin ? 'is-invalid' : ''}`}
                placeholder="27ABCDE1234F1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              />
              {formErrors.gstin && <span className="tx-error-text">{formErrors.gstin}</span>}
            </div>
          </div>

          <div className="tx-ca-form-row">
            <div className="tx-ca-form-group">
              <label>Authorized Mobile (10 digits) *</label>
              <input
                type="tel"
                maxLength={10}
                className={`tx-input ${formErrors.contact ? 'is-invalid' : ''}`}
                placeholder="9820012345"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
              {formErrors.contact && <span className="tx-error-text">{formErrors.contact}</span>}
            </div>

            <div className="tx-ca-form-group">
              <label>Official Email *</label>
              <input
                type="email"
                className={`tx-input ${formErrors.email ? 'is-invalid' : ''}`}
                placeholder="compliance@apex.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {formErrors.email && <span className="tx-error-text">{formErrors.email}</span>}
            </div>
          </div>

          <div className="tx-ca-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Onboard Client
            </Button>
          </div>
        </form>
      </Modal>

      {/* Client 360 Dossier Modal */}
      {selectedCust && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Client Compliance Dossier — ${selectedCust.name}`}
        >
          <div className="tx-ca-dossier-body">
            <div className="tx-dossier-card-top">
              <div>
                <span className="tx-cust-id">{selectedCust.id}</span>
                <h3 className="tx-dossier-name">{selectedCust.name}</h3>
                <span className="tx-dossier-meta">GSTIN: {selectedCust.gstin} • PAN: {selectedCust.pan}</span>
              </div>
              <StatusBadge status={selectedCust.status} />
            </div>

            <div className="tx-dossier-contacts-grid">
              <div className="tx-d-contact">
                <span>Direct Contact:</span>
                <strong>{selectedCust.contact}</strong>
              </div>
              <div className="tx-d-contact">
                <span>Email Address:</span>
                <strong>{selectedCust.email}</strong>
              </div>
            </div>

            <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Active Filing Engagements</h4>
            <div className="tx-dossier-filings-list">
              <div className="tx-d-filing-item">
                <div>
                  <strong>GSTR-3B Monthly Return (September 2026)</strong>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--tx-secondary-text)' }}>Due Date: 20 Oct 2026 • Assigned: Suresh Kumar</span>
                </div>
                <StatusBadge status="IN_PROGRESS" />
              </div>
              <div className="tx-d-filing-item">
                <div>
                  <strong>Advance Tax Q2 Review (Section 208)</strong>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--tx-secondary-text)' }}>Due Date: 15 Sep 2026 • Verified</span>
                </div>
                <StatusBadge status="COMPLETED" />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>
                Close Dossier
              </Button>
              <Button
                variant="orange"
                onClick={() => {
                  showToast(`Tax compliance reminder dispatched to ${selectedCust.name}.`, 'info');
                  setDetailModalOpen(false);
                }}
              >
                Send Direct Reminder
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
