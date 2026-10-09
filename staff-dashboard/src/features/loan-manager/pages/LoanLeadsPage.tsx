import React, { useState, useEffect } from 'react';
import { Search, Plus, Building, CheckCircle2, X } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';
import { loanManagerApi } from '../services/loanManagerApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import { LeadItem } from '../../../shared/types/workflowTypes';
import LoanLeadCard from '../components/LoanLeadCard';
import LoanLeadAddModal from '../components/LoanLeadAddModal';
import './LoanLeadsPage.css';

export default function LoanLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [assignedOfficer, setAssignedOfficer] = useState('Rajesh Patel');
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    business: '',
    category: 'MSME',
    requestedAmount: '',
    phone: '',
    email: '',
    source: 'Direct Ingestion'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [convertForm, setConvertForm] = useState({
    loanProduct: 'Working Capital Term Loan',
    bankPartner: 'HDFC Bank & SIDBI',
    tenureMonths: 36
  });

  const loadLeads = () => {
    loanManagerApi.getLeads().then((data) => {
      setLeads(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadLeads();
    const unsub = loanManagerApi.subscribe(() => loadLeads());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const openConvertModal = (lead: LeadItem) => {
    setSelectedLead(lead);
    setConvertModalOpen(true);
  };

  const openAssignModal = (lead: LeadItem) => {
    setSelectedLead(lead);
    setAssignModalOpen(true);
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    await loanManagerApi.convertLeadToApplication(selectedLead.id, convertForm);
    loadLeads();
    setConvertModalOpen(false);
    showToast(
      `Lead "${selectedLead.name}" converted to Loan Application (Assigned to Underwriting).`,
      'success'
    );
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setLeads(
      leads.map((l) =>
        l.id === selectedLead.id
          ? { ...l, assignedOfficer }
          : l
      )
    );
    setAssignModalOpen(false);
    showToast(`Lead "${selectedLead.name}" assigned to ${assignedOfficer}.`, 'success');
  };

  const validateLeadForm = () => {
    const errors: Record<string, string> = {};
    if (!newLeadForm.name.trim() || newLeadForm.name.trim().length < 3) {
      errors.name = 'Borrower / Entity name must be at least 3 characters.';
    }
    if (!newLeadForm.business.trim()) {
      errors.business = 'Operating business activity is required.';
    }
    if (!newLeadForm.requestedAmount || Number(newLeadForm.requestedAmount) <= 0) {
      errors.requestedAmount = 'Requested loan capital must be a positive number.';
    }
    const phoneClean = newLeadForm.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      errors.phone = 'Enter a valid 10-digit mobile number.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newLeadForm.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLeadForm()) return;

    const newLead = {
      name: newLeadForm.name.trim(),
      business: newLeadForm.business.trim(),
      category: newLeadForm.category,
      requestedAmount: Number(newLeadForm.requestedAmount),
      phone: newLeadForm.phone.trim(),
      email: newLeadForm.email.trim(),
      source: newLeadForm.source,
      cibilEstimate: 740,
      status: 'NEW' as const,
      assignedOfficer: 'Rajesh Patel',
      date: 'Today, Just now'
    };

    await loanManagerApi.addLead(newLead);
    loadLeads();
    setAddModalOpen(false);
    setNewLeadForm({
      name: '',
      business: '',
      category: 'MSME',
      requestedAmount: '',
      phone: '',
      email: '',
      source: 'Direct Ingestion'
    });
    setFormErrors({});
    showToast(`New borrower lead "${newLead.name}" ingested into pipeline!`, 'success');
  };

  const filteredLeads = leads.filter((lead) => {
    const matchCat = categoryFilter === 'ALL' || lead.category === categoryFilter;
    const q = search.toLowerCase();
    const matchSearch =
      (lead.name?.toLowerCase() || '').includes(q) ||
      (lead.business?.toLowerCase() || '').includes(q) ||
      (lead.id?.toLowerCase() || '').includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="tx-loan-leads-page">
      {feedback && (
        <div className={`tx-lead-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <PageHeader
        title="Borrower Leads & Ingestion Queue"
        subtitle="Manage prospective retail and commercial borrower inquiries, pre-qualification checks, and pipeline conversions"
        breadcrumb={['Loan Domain', 'Pipeline', 'Leads']}
        actions={
          <button
            type="button"
            className="tx-btn-add-lead"
            onClick={() => {
              setFormErrors({});
              setAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Ingest Borrower Lead</span>
          </button>
        }
      />

      <div className="tx-leads-controls">
        <div className="tx-lead-search">
          <Search size={16} className="tx-search-icon" />
          <input
            type="text"
            placeholder="Search leads by borrower, business, ID..."
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

        <div className="tx-lead-cat-pills">
          <button
            type="button"
            className={`tx-cat-pill ${categoryFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('ALL')}
          >
            All Leads ({leads.length})
          </button>
          <button
            type="button"
            className={`tx-cat-pill ${categoryFilter === 'MSME' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('MSME')}
          >
            MSME Business
          </button>
          <button
            type="button"
            className={`tx-cat-pill ${categoryFilter === 'RETAIL' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('RETAIL')}
          >
            Retail Mortgages
          </button>
          <button
            type="button"
            className={`tx-cat-pill ${categoryFilter === 'WORKING_CAPITAL' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('WORKING_CAPITAL')}
          >
            Working Capital
          </button>
        </div>
      </div>

      <div className="tx-leads-grid">
        {filteredLeads.length === 0 ? (
          <div className="tx-leads-empty">
            <Building size={36} color="var(--tx-muted-text)" />
            <p>No borrower leads found matching your criteria.</p>
            <button
              type="button"
              className="tx-btn-link-action"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <LoanLeadCard
              key={lead.id}
              lead={lead}
              onAssign={openAssignModal}
              onConvert={openConvertModal}
            />
          ))
        )}
      </div>

      <LoanLeadAddModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        form={newLeadForm}
        setForm={setNewLeadForm}
        errors={formErrors}
        onSubmit={handleAddLeadSubmit}
      />

      {selectedLead && (
        <Modal
          isOpen={convertModalOpen}
          onClose={() => setConvertModalOpen(false)}
          title={`Convert Lead — ${selectedLead.name}`}
        >
          <form onSubmit={handleConvertSubmit} className="tx-convert-form">
            <p className="tx-convert-desc">
              Advance <strong>{selectedLead.name}</strong> from raw lead inquiry into active
              credit pipeline. Target Capital: <strong>{selectedLead.requestedAmount}</strong>:
            </p>

            <div className="tx-lead-form-group" style={{ margin: '14px 0' }}>
              <label>Select Syndicate Lending Product:</label>
              <select
                className="tx-input"
                value={convertForm.loanProduct}
                onChange={(e) => setConvertForm({ ...convertForm, loanProduct: e.target.value })}
              >
                <option value="Working Capital Term Loan">Working Capital Term Loan</option>
                <option value="Machinery & Equipment Expansion Loan">Machinery &amp; Equipment Expansion Loan</option>
                <option value="Commercial LAP (Loan Against Property)">Commercial LAP (Loan Against Property)</option>
                <option value="CGTMSE Collateral Free Credit">CGTMSE Collateral Free Credit</option>
              </select>
            </div>

            <div className="tx-lead-form-group" style={{ margin: '14px 0' }}>
              <label>Syndicate Banking Partner:</label>
              <select
                className="tx-input"
                value={convertForm.bankPartner}
                onChange={(e) => setConvertForm({ ...convertForm, bankPartner: e.target.value })}
              >
                <option value="HDFC Bank & SIDBI">HDFC Bank &amp; SIDBI</option>
                <option value="ICICI Commercial Banking">ICICI Commercial Banking</option>
                <option value="Axis Bank SME Desk">Axis Bank SME Desk</option>
                <option value="Bank of Baroda MSME">Bank of Baroda MSME</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <Button variant="secondary" onClick={() => setConvertModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="orange" type="submit">
                Confirm Pipeline Ingestion
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {selectedLead && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Credit Officer — ${selectedLead.name}`}
        >
          <form onSubmit={handleAssignSubmit} className="tx-assign-form">
            <p className="tx-assign-desc">
              Assign credit officer to perform field inspection and financial statement appraisal for{' '}
              <strong>{selectedLead.name}</strong>:
            </p>

            <div className="tx-lead-form-group" style={{ margin: '14px 0' }}>
              <label>Select Credit Officer:</label>
              <select
                className="tx-input"
                value={assignedOfficer}
                onChange={(e) => setAssignedOfficer(e.target.value)}
              >
                <option value="Rajesh Patel">Rajesh Patel (Senior Credit Officer)</option>
                <option value="Neha Gupta">Neha Gupta (Loan Documentation Executive)</option>
                <option value="Vikram Malhotra">Vikram Malhotra (Underwriting Analyst)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="orange" type="submit">
                Save Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
