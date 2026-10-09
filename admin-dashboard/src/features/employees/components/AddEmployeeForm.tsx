import React, { useState, useEffect } from 'react';
import Button from '../../../core/components/Button/Button';
import { ROLES } from '../../../core/constants/roles';
import './AddEmployeeForm.css';

interface AddEmployeeFormProps {
  roleType?: string;
  initialData?: any;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function AddEmployeeForm({
  roleType = ROLES.MANAGER,
  initialData = null,
  onSubmit,
  onCancel
}: AddEmployeeFormProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    team: 'Direct Tax & GST',
    role: roleType,
    managerName: roleType === ROLES.AGENT ? 'Sanjay Verma' : ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        team: initialData.team || 'Direct Tax & GST',
        role: initialData.role || roleType,
        managerName: initialData.managerName || (roleType === ROLES.AGENT ? 'Sanjay Verma' : '')
      });
    }
  }, [initialData, roleType]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = 'Full name must be at least 3 characters.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid corporate email address.';
    }
    const phoneClean = formData.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      errs.phone = 'Enter a valid 10-digit mobile number.';
    }
    if (!formData.team.trim()) {
      errs.team = 'Department/Team assignment is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) onSubmit(formData);
  };

  return (
    <form className="tx-add-emp-form" onSubmit={handleSubmit}>
      <div className="tx-emp-field">
        <label className="tx-emp-label">Full Name *</label>
        <input
          type="text"
          className={`tx-emp-input ${errors.name ? 'is-invalid' : ''}`}
          placeholder="e.g. Ramesh Chandra"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        {errors.name && <span className="tx-error-text">{errors.name}</span>}
      </div>

      <div className="tx-form-row">
        <div className="tx-emp-field">
          <label className="tx-emp-label">Work Email *</label>
          <input
            type="email"
            className={`tx-emp-input ${errors.email ? 'is-invalid' : ''}`}
            placeholder="ramesh.c@taxedge.in"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <span className="tx-error-text">{errors.email}</span>}
        </div>
        <div className="tx-emp-field">
          <label className="tx-emp-label">Phone Number *</label>
          <input
            type="tel"
            className={`tx-emp-input ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="+91 98765 00000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          {errors.phone && <span className="tx-error-text">{errors.phone}</span>}
        </div>
      </div>

      <div className="tx-form-row">
        <div className="tx-emp-field">
          <label className="tx-emp-label">Department / Division *</label>
          <select
            className="tx-emp-input"
            value={formData.team}
            onChange={(e) => setFormData({ ...formData, team: e.target.value })}
          >
            <option value="Direct Tax & GST">Direct Tax &amp; GST</option>
            <option value="Corporate Advisory & MCA">Corporate Advisory &amp; MCA</option>
            <option value="MSME Lending & Appraisal">MSME Lending &amp; Appraisal</option>
            <option value="Retail Loans & Sanctions">Retail Loans &amp; Sanctions</option>
            <option value="Central Audit & Compliance">Central Audit &amp; Compliance</option>
          </select>
        </div>

        {roleType === ROLES.AGENT && (
          <div className="tx-emp-field">
            <label className="tx-emp-label">Supervising Department Manager</label>
            <select
              className="tx-emp-input"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
            >
              <option value="Sanjay Verma">Sanjay Verma (CA Domain Lead)</option>
              <option value="Ananya Deshmukh">Ananya Deshmukh (Credit Head)</option>
              <option value="Rohan Sharma">Rohan Sharma (Super Admin)</option>
            </select>
          </div>
        )}
      </div>

      <div className="tx-emp-form-actions">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="orange" type="submit">
          {initialData ? 'Save Employee Changes' : `Add ${roleType === ROLES.MANAGER ? 'Manager' : 'Executive'}`}
        </Button>
      </div>
    </form>
  );
}
