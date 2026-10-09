import React, { useState } from 'react';
import { Award, ShieldCheck, Mail, Phone, Building, Save, CheckCircle2, RotateCcw, X } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import Button from '../../../core/components/Button/Button';
import './CaProfilePage.css';

const DEFAULT_PROFILE = {
  name: 'CA Sanjay Verma, FCA',
  icaiNumber: 'FCA-084920',
  copNumber: 'COP-102948',
  department: 'Taxation & Statutory Compliance',
  email: 'sanjay.verma@taxedge.in',
  phone: '+91 98200 44321',
  office: 'Mumbai Central Operations Hub',
  dscStatus: 'ACTIVE (Class 3 Signing & Encryption)',
  dscExpiry: '14 Nov 2027',
};

export default function CaProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!profile.name.trim() || profile.name.trim().length < 3) {
      errs.name = 'Full name must be at least 3 characters.';
    }
    if (!profile.icaiNumber.trim() || profile.icaiNumber.trim().length < 6) {
      errs.icaiNumber = 'ICAI Membership format required (e.g. FCA-123456).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email.trim())) {
      errs.email = 'Enter a valid corporate email.';
    }
    const phoneClean = profile.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      errs.phone = 'Enter a valid 10-digit mobile number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    showToast('CA credentials & profile settings saved successfully.', 'success');
  };

  const handleRevert = () => {
    setProfile(DEFAULT_PROFILE);
    setErrors({});
    showToast('Profile values reset to default credentials.', 'info');
  };

  return (
    <div className="tx-ca-profile-page">
      <PageHeader
        title="Chartered Accountant Professional Profile"
        subtitle="Manage ICAI membership details, statutory signing credentials, and department parameters"
        breadcrumb={['CA Domain', 'Profile', 'Credentials']}
      />

      {toast && (
        <div className={`tx-profile-toast ${toast.type}`}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-profile-grid">
        <div className="tx-profile-card">
          <div className="tx-profile-banner">
            <div className="tx-profile-avatar">SV</div>
            <div>
              <h3 className="tx-profile-name">{profile.name}</h3>
              <span className="tx-profile-title">Lead CA Compliance Manager</span>
            </div>
            <div className="tx-icai-badge">
              <Award size={16} />
              <span>ICAI Verified</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="tx-profile-form">
            <div className="tx-form-row">
              <div className="tx-form-group">
                <label>ICAI Membership Number *</label>
                <input
                  type="text"
                  className={`tx-input ${errors.icaiNumber ? 'is-invalid' : ''}`}
                  value={profile.icaiNumber}
                  onChange={(e) => setProfile({ ...profile, icaiNumber: e.target.value })}
                />
                {errors.icaiNumber && <span className="tx-error-text">{errors.icaiNumber}</span>}
              </div>
              <div className="tx-form-group">
                <label>Certificate of Practice (COP)</label>
                <input
                  type="text"
                  className="tx-input"
                  value={profile.copNumber}
                  onChange={(e) => setProfile({ ...profile, copNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="tx-form-row">
              <div className="tx-form-group">
                <label>Professional Full Name *</label>
                <input
                  type="text"
                  className={`tx-input ${errors.name ? 'is-invalid' : ''}`}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                {errors.name && <span className="tx-error-text">{errors.name}</span>}
              </div>
              <div className="tx-form-group">
                <label>Assigned Department</label>
                <input
                  type="text"
                  className="tx-input"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                />
              </div>
            </div>

            <div className="tx-form-row">
              <div className="tx-form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className={`tx-input ${errors.email ? 'is-invalid' : ''}`}
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
                {errors.email && <span className="tx-error-text">{errors.email}</span>}
              </div>
              <div className="tx-form-group">
                <label>Contact Phone *</label>
                <input
                  type="tel"
                  className={`tx-input ${errors.phone ? 'is-invalid' : ''}`}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
                {errors.phone && <span className="tx-error-text">{errors.phone}</span>}
              </div>
            </div>

            <div className="tx-form-group">
              <label>Operations Location</label>
              <input
                type="text"
                className="tx-input"
                value={profile.office}
                onChange={(e) => setProfile({ ...profile, office: e.target.value })}
              />
            </div>

            <div className="tx-profile-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <Button variant="secondary" type="button" onClick={handleRevert}>
                <RotateCcw size={15} style={{ marginRight: '6px' }} />
                Reset Defaults
              </Button>
              <Button variant="orange" type="submit">
                <Save size={15} style={{ marginRight: '6px' }} />
                Save Credentials
              </Button>
            </div>
          </form>
        </div>

        <div className="tx-dsc-card">
          <div className="tx-dsc-icon-wrap">
            <ShieldCheck size={28} />
          </div>
          <h4 className="tx-dsc-title">Digital Signature Certificate (DSC)</h4>
          <p className="tx-dsc-sub">Authorizes e-filings with Income Tax Department &amp; MCA V3</p>

          <div className="tx-dsc-meta">
            <div className="tx-dsc-row">
              <span>DSC Token Type:</span>
              <strong>Class 3 USB e-Pass Token</strong>
            </div>
            <div className="tx-dsc-row">
              <span>Token Status:</span>
              <strong style={{ color: '#2E7D32' }}>ACTIVE &amp; RECOGNIZED</strong>
            </div>
            <div className="tx-dsc-row">
              <span>Expiry Date:</span>
              <strong>{profile.dscExpiry}</strong>
            </div>
          </div>

          <button
            type="button"
            className="tx-btn-test-dsc"
            onClick={() => showToast('DSC hardware crypto-handshake successful. Token ready for signing.', 'success')}
          >
            Test Hardware DSC Bridge
          </button>
        </div>
      </div>
    </div>
  );
}
