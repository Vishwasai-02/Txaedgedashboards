import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, X } from 'lucide-react';
import CustomerList from '../components/CustomerList';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import Button from '../../../core/components/Button/Button';
import { customersApi } from '../services/customersApi';
import { Customer } from '../../../shared/types/workflowTypes';
import CustomerFormModal from '../components/CustomerFormModal';
import CustomerDossierModal from '../components/CustomerDossierModal';
import './CustomersPage.css';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    pan: '',
    gstin: '',
    kycStatus: 'VERIFIED',
    assignedManagerId: 'MGR001',
    assignedManagerName: 'Sanjay Verma (CA Operations)',
    domain: 'CA'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Confirmation Dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    customer: Customer | null;
  }>({
    isOpen: false,
    customer: null
  });

  const loadCustomers = () => {
    customersApi.getCustomers().then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    loadCustomers();
    const unsubscribe = customersApi.subscribe(() => {
      loadCustomers();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = 'Contact/Director name must be at least 3 characters.';
    }
    if (!formData.businessName.trim()) {
      errors.businessName = 'Business or Registered Entity name is required.';
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.pan.trim().toUpperCase())) {
      errors.pan = 'Enter a valid 10-character PAN (e.g. ABCDE1234F).';
    }
    if (formData.gstin.trim() && formData.gstin.trim().length !== 15) {
      errors.gstin = 'GSTIN must be 15 alphanumeric characters.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = 'Enter a valid 10-digit mobile number.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      businessName: '',
      email: '',
      phone: '',
      pan: '',
      gstin: '',
      kycStatus: 'PENDING',
      assignedManagerId: 'MGR001',
      assignedManagerName: 'Sanjay Verma (CA Operations)',
      domain: 'CA'
    });
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newCust = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name.trim(),
      businessName: formData.businessName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      pan: formData.pan.trim().toUpperCase(),
      gstin: formData.gstin.trim().toUpperCase() || 'NOT_APPLICABLE',
      totalApplications: 1,
      activeFilings: 1,
      totalFilings: 1,
      kycStatus: formData.kycStatus as 'VERIFIED' | 'PENDING',
      assignedManagerId: formData.assignedManagerId,
      assignedManagerName: formData.assignedManagerName,
      domain: formData.domain as 'CA' | 'LOAN',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    await customersApi.createCustomer(newCust);
    loadCustomers();
    setAddModalOpen(false);
    showToast(`Client entity "${newCust.businessName}" onboarded and assigned to ${newCust.assignedManagerName}!`, 'success');
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      businessName: customer.businessName,
      email: customer.email,
      phone: customer.phone,
      pan: customer.pan,
      gstin: customer.gstin,
      kycStatus: customer.kycStatus,
      assignedManagerId: customer.assignedManagerId || 'MGR001',
      assignedManagerName: customer.assignedManagerName || 'Sanjay Verma (CA Operations)',
      domain: customer.domain || 'CA'
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedCustomer) return;

    const patch = {
      name: formData.name.trim(),
      businessName: formData.businessName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      pan: formData.pan.trim().toUpperCase(),
      gstin: formData.gstin.trim().toUpperCase(),
      kycStatus: formData.kycStatus as 'VERIFIED' | 'PENDING',
      assignedManagerId: formData.assignedManagerId,
      assignedManagerName: formData.assignedManagerName,
      domain: formData.domain as 'CA' | 'LOAN'
    };

    await customersApi.updateCustomer(selectedCustomer.id, patch);
    loadCustomers();
    setEditModalOpen(false);
    showToast(`Client profile for "${formData.businessName}" updated successfully!`, 'success');
  };

  const handleOpenView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  const handleOpenDelete = (customer: Customer) => {
    setDeleteConfirm({
      isOpen: true,
      customer
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.customer) return;
    await customersApi.deleteCustomer(deleteConfirm.customer.id);
    loadCustomers();
    showToast(`Client profile for "${deleteConfirm.customer.businessName}" removed.`, 'warning');
    setDeleteConfirm({ isOpen: false, customer: null });
  };

  return (
    <div className="tx-cust-page">
      {feedback && (
        <div className={`tx-cust-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-cust-page-header">
        <div className="tx-cust-page-title">
          <h2>Customer Directory</h2>
          <p>
            Client profiles, entities, legal identifiers, and consolidated service engagements
          </p>
        </div>
        <Button
          variant="orange"
          icon={<UserPlus size={18} />}
          onClick={handleOpenAdd}
        >
          Add Client Entity
        </Button>
      </div>

      <CustomerList
        customers={customers}
        loading={loading}
        onViewCustomer={handleOpenView}
        onEditCustomer={handleOpenEdit}
        onDeleteCustomer={handleOpenDelete}
      />

      <CustomerFormModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        isEdit={false}
        title="Onboard New Client Entity"
        form={formData}
        setForm={setFormData}
        errors={formErrors}
        onSubmit={handleAddSubmit}
      />

      <CustomerFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        isEdit={true}
        title={`Edit Client Profile — ${selectedCustomer?.id}`}
        form={formData}
        setForm={setFormData}
        errors={formErrors}
        onSubmit={handleEditSubmit}
      />

      <CustomerDossierModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        selectedCustomer={selectedCustomer}
        onOpenEdit={handleOpenEdit}
      />

      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, customer: null })}
        onConfirm={executeDelete}
        title="Deactivate Customer Account"
        message={`Are you sure you want to remove ${deleteConfirm.customer?.businessName} (${deleteConfirm.customer?.id}) from the active customer directory?`}
        variant="danger"
        confirmText="Confirm Deactivation"
      />
    </div>
  );
}
