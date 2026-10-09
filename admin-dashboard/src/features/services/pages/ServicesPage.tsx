import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  XCircle,
  Tag,
  DollarSign,
  Clock,
  Layers,
  Trash2,
  X
} from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge/StatusBadge';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import { servicesApi } from '../services/servicesApi';
import { PlatformService } from '../../../shared/types/workflowTypes';
import './ServicesPage.css';

export default function ServicesPage() {
  const [services, setServices] = useState<PlatformService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<PlatformService | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const fetchServices = () => {
    servicesApi.getServices().then((data) => {
      setServices(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchServices();
    const unsub = servicesApi.subscribe(() => fetchServices());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Direct Tax',
    fee: '',
    sla: '3-5 Business Days',
    desc: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Confirmation Modals
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    isOpen: boolean;
    service: PlatformService | null;
  }>({
    isOpen: false,
    service: null
  });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    service: PlatformService | null;
  }>({
    isOpen: false,
    service: null
  });

  const categories = ['All', 'Direct Tax', 'Indirect Tax', 'MCA & Corporate', 'MSME Loans', 'Retail Loans', 'Advisory'];

  const showToast = (message: string, type: string = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredServices = services.filter((srv) => {
    const matchSearch =
      srv.name.toLowerCase().includes(search.toLowerCase()) ||
      srv.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || srv.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.code.trim() || formData.code.trim().length < 4) {
      errors.code = 'Service code must be at least 4 characters (e.g. TX-GST-01).';
    }
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = 'Service title must be at least 3 characters.';
    }
    if (!formData.fee || Number(formData.fee) <= 0) {
      errors.fee = 'Base fee must be a valid positive amount.';
    }
    if (!formData.sla.trim()) {
      errors.sla = 'Standard SLA turnaround time is required.';
    }
    if (!formData.desc.trim() || formData.desc.trim().length < 10) {
      errors.desc = 'Scope of work description must be at least 10 characters.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      code: `TX-SRV-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Direct Tax',
      fee: '',
      sla: '3-5 Business Days',
      desc: '',
      active: true
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (service: PlatformService) => {
    setEditingService(service);
    setFormData({
      code: service.code,
      name: service.name,
      category: service.category,
      fee: String(service.fee),
      sla: service.sla,
      desc: service.desc,
      active: service.active
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingService) {
      await servicesApi.updateService(editingService.id, {
        ...formData,
        fee: Number(formData.fee)
      });
      showToast(`Service "${formData.name}" catalog updated successfully!`, 'success');
    } else {
      const newService = {
        ...formData,
        fee: Number(formData.fee)
      };
      await servicesApi.createService(newService);
      showToast(`New service "${newService.name}" published to catalog!`, 'success');
    }
    setModalOpen(false);
  };

  const promptToggleStatus = (service: PlatformService) => {
    if (service.active) {
      setConfirmStatusModal({ isOpen: true, service });
    } else {
      executeToggleStatus(service.id);
    }
  };

  const executeToggleStatus = async (id?: string) => {
    if (!id) return;
    const updated = await servicesApi.toggleStatus(id);
    setConfirmStatusModal({ isOpen: false, service: null });
    showToast(
      `Service "${updated?.name}" is now ${updated?.active ? 'Active' : 'Deactivated'}.`,
      updated?.active ? 'success' : 'warning'
    );
  };

  const promptDeleteService = (service: PlatformService) => {
    setConfirmDeleteModal({ isOpen: true, service });
  };

  const executeDeleteService = async () => {
    if (!confirmDeleteModal.service) return;
    const srvName = confirmDeleteModal.service.name;
    await servicesApi.deleteService(confirmDeleteModal.service.id);
    showToast(`Service "${srvName}" deleted from catalog.`, 'warning');
    setConfirmDeleteModal({ isOpen: false, service: null });
  };

  const totalActive = services.filter((s) => s.active).length;
  const taxCount = services.filter((s) => s.category.includes('Tax')).length;
  const loanCount = services.filter((s) => s.category.includes('Loan')).length;

  return (
    <div className="tx-services-page">
      {feedback && (
        <div className={`tx-services-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <PageHeader
        title="Service Catalog & Pricing"
        subtitle="Manage end-to-end tax filings, corporate compliance, and loan products across TaxEdge"
        breadcrumb={['Admin', 'Catalog', 'Services']}
        actions={
          <button type="button" className="tx-btn-add-service" onClick={openAddModal}>
            <Plus size={16} />
            <span>Add New Service</span>
          </button>
        }
      />

      <div className="tx-services-kpis">
        <div className="tx-service-kpi-card">
          <div className="tx-kpi-icon-wrap icon-blue"><Layers size={20} /></div>
          <div>
            <span className="tx-kpi-num">{services.length}</span>
            <span className="tx-kpi-lbl">Total Offerings</span>
          </div>
        </div>
        <div className="tx-service-kpi-card">
          <div className="tx-kpi-icon-wrap icon-green"><CheckCircle2 size={20} /></div>
          <div>
            <span className="tx-kpi-num">{totalActive}</span>
            <span className="tx-kpi-lbl">Active Services</span>
          </div>
        </div>
        <div className="tx-service-kpi-card">
          <div className="tx-kpi-icon-wrap icon-navy"><Tag size={20} /></div>
          <div>
            <span className="tx-kpi-num">{taxCount}</span>
            <span className="tx-kpi-lbl">Tax & MCA Services</span>
          </div>
        </div>
        <div className="tx-service-kpi-card">
          <div className="tx-kpi-icon-wrap icon-orange"><DollarSign size={20} /></div>
          <div>
            <span className="tx-kpi-num">{loanCount}</span>
            <span className="tx-kpi-lbl">Lending Products</span>
          </div>
        </div>
      </div>

      <div className="tx-services-filter-bar">
        <div className="tx-services-search">
          <Search size={16} color="var(--tx-muted-text)" />
          <input
            type="text"
            placeholder="Search catalog by service name, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="tx-clear-filter-btn"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="tx-services-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`tx-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="tx-services-grid">
        {filteredServices.length === 0 ? (
          <div className="tx-services-empty">
            <Layers size={40} className="tx-empty-icon" />
            <h3>No services found</h3>
            <p>Try adjusting your search keywords or category filters.</p>
            <button
              type="button"
              className="tx-btn-link-action"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id} className={`tx-service-card ${!service.active ? 'inactive' : ''}`}>
              <div className="tx-service-card-header">
                <span className="tx-service-code-badge">{service.code}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`tx-status-pill ${service.active ? 'active' : 'inactive'}`}>
                    {service.active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    className="tx-btn-card-edit"
                    onClick={() => openEditModal(service)}
                    title="Edit Service Parameters"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className="tx-btn-card-delete"
                    onClick={() => promptDeleteService(service)}
                    title="Delete Service"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h4 className="tx-service-name">{service.name}</h4>
              <span className="tx-service-category-tag">{service.category}</span>
              <p className="tx-service-desc">{service.desc}</p>

              <div className="tx-service-meta-grid">
                <div className="tx-meta-item">
                  <span className="tx-meta-lbl">Standard Fee</span>
                  <span className="tx-meta-val fee">₹{service.fee.toLocaleString('en-IN')}</span>
                </div>
                <div className="tx-meta-item">
                  <span className="tx-meta-lbl">Target SLA</span>
                  <span className="tx-meta-val"><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />{service.sla}</span>
                </div>
              </div>

              <div className="tx-service-card-footer">
                <button
                  type="button"
                  className={`tx-toggle-active-btn ${service.active ? 'btn-deactivate' : 'btn-activate'}`}
                  onClick={() => promptToggleStatus(service)}
                >
                  {service.active ? 'Deactivate Offering' : 'Activate Offering'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service Catalog Item'}
      >
        <form onSubmit={handleSave} className="tx-service-form">
          <div className="tx-form-row">
            <div className="tx-form-group">
              <label>Service Code *</label>
              <input
                type="text"
                className={`tx-input ${formErrors.code ? 'is-invalid' : ''}`}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
              {formErrors.code && <span className="tx-error-text">{formErrors.code}</span>}
            </div>
            <div className="tx-form-group">
              <label>Category *</label>
              <select
                className="tx-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Direct Tax">Direct Tax</option>
                <option value="Indirect Tax">Indirect Tax</option>
                <option value="MCA & Corporate">MCA & Corporate</option>
                <option value="MSME Loans">MSME Loans</option>
                <option value="Retail Loans">Retail Loans</option>
                <option value="Advisory">Advisory</option>
              </select>
            </div>
          </div>

          <div className="tx-form-group">
            <label>Service Name *</label>
            <input
              type="text"
              className={`tx-input ${formErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Tax Audit Compliance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <span className="tx-error-text">{formErrors.name}</span>}
          </div>

          <div className="tx-form-row">
            <div className="tx-form-group">
              <label>Base Fee (₹) *</label>
              <input
                type="number"
                className={`tx-input ${formErrors.fee ? 'is-invalid' : ''}`}
                min="1"
                placeholder="2499"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
              />
              {formErrors.fee && <span className="tx-error-text">{formErrors.fee}</span>}
            </div>
            <div className="tx-form-group">
              <label>Standard Turnaround Time *</label>
              <input
                type="text"
                className={`tx-input ${formErrors.sla ? 'is-invalid' : ''}`}
                placeholder="3-5 Business Days"
                value={formData.sla}
                onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
              />
              {formErrors.sla && <span className="tx-error-text">{formErrors.sla}</span>}
            </div>
          </div>

          <div className="tx-form-group">
            <label>Description / Scope of Work *</label>
            <textarea
              rows={3}
              className={`tx-input ${formErrors.desc ? 'is-invalid' : ''}`}
              placeholder="Detailed description of what is included in this service..."
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            />
            {formErrors.desc && <span className="tx-error-text">{formErrors.desc}</span>}
          </div>

          <div className="tx-modal-footer-btns">
            <button type="button" className="tx-btn-cancel" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="tx-btn-submit">
              {editingService ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmStatusModal.isOpen}
        onClose={() => setConfirmStatusModal({ isOpen: false, service: null })}
        onConfirm={() => executeToggleStatus(confirmStatusModal.service?.id)}
        title="Deactivate Service Offering"
        message={`Are you sure you want to deactivate "${confirmStatusModal.service?.name}"? New client applications will be paused for this catalog item.`}
        variant="danger"
        confirmText="Confirm Deactivate"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={() => setConfirmDeleteModal({ isOpen: false, service: null })}
        onConfirm={executeDeleteService}
        title="Delete Service from Catalog"
        message={`Are you sure you want to permanently delete "${confirmDeleteModal.service?.name}" (${confirmDeleteModal.service?.code})?`}
        variant="danger"
        confirmText="Delete Service"
      />
    </div>
  );
}
