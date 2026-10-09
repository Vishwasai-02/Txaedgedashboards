import React from 'react';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';

interface CaAddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    name: string;
    email: string;
    phone: string;
    role: string;
    activeCases: number | string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
}

export function CaAddAgentModal({
  isOpen,
  onClose,
  form,
  setForm,
  errors,
  onSubmit
}: CaAddAgentModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New CA Operations Executive"
    >
      <form onSubmit={onSubmit} className="tx-add-agent-form">
        <div className="tx-form-group" style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
            Agent Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Ramesh Iyer"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="tx-input"
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: errors.name ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
          />
          {errors.name && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
        </div>

        <div className="tx-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div className="tx-form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
              Official Email *
            </label>
            <input
              type="email"
              placeholder="ramesh.i@taxedge.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="tx-input"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: errors.email ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
            />
            {errors.email && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
          </div>

          <div className="tx-form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
              Direct Mobile Phone *
            </label>
            <input
              type="tel"
              placeholder="+91 98200 88990"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="tx-input"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: errors.phone ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
            />
            {errors.phone && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
          </div>
        </div>

        <div className="tx-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
          <div className="tx-form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
              Statutory Role Specialization
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="tx-select"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="Direct Tax Executive">Direct Tax Executive</option>
              <option value="ITR & Compliance Executive">ITR & Compliance Executive</option>
              <option value="GST Filing Specialist">GST Filing Specialist</option>
              <option value="MCA & ROC Compliance Officer">MCA & ROC Compliance Officer</option>
            </select>
          </div>

          <div className="tx-form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
              Initial Caseload (Active Files)
            </label>
            <input
              type="number"
              min="0"
              max="15"
              value={form.activeCases}
              onChange={(e) => setForm({ ...form, activeCases: e.target.value })}
              className="tx-input"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="orange" type="submit">
            Appoint CA Agent
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CaAddAgentModal;
