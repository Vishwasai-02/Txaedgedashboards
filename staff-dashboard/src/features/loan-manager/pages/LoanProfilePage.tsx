import React, { useState } from 'react';
import { ShieldCheck, Building, Save, CheckCircle2, Award, DollarSign, RotateCcw, AlertTriangle, KeyRound } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import './LoanProfilePage.css';

const DEFAULT_PROFILE = {
  name: 'Ananya Deshmukh',
  title: 'Chief Lending Officer & Credit Head',
  delegationLimit: '₹1,50,00,000 (1.5 Cr Single Sign-off)',
  department: 'Commercial & Retail Credit Syndicate',
  email: 'ananya.deshmukh@taxedge.in',
  phone: '+91 98200 66789',
  office: 'Mumbai Central Lending Desk',
  partnerLenders: 'HDFC Bank, ICICI Bank, Axis Bank, SIDBI CGTMSE'
};

export default function LoanProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [toast, setToast] = useState('');
  const [tokenTesting, setTokenTesting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!profile.name.trim() || profile.name.trim().length < 3) {
      errs.name = 'Full name must contain at least 3 characters.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email.trim())) {
      errs.email = 'Please provide a valid official email address.';
    }
    const phoneRegex = /^[+0-9\s-]{10,15}$/;
    if (!phoneRegex.test(profile.phone.trim())) {
      errs.phone = 'Phone number format is invalid (10 to 15 digits).';
    }
    if (!profile.delegationLimit.trim()) {
      errs.delegationLimit = 'Credit delegation cap is mandatory.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setToast('Credit Manager credentials and delegation parameters saved successfully.');
    setTimeout(() => setToast(''), 4500);
  };

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
    setErrors({});
    setToast('Profile parameters reverted to default configuration.');
    setTimeout(() => setToast(''), 3500);
  };

  const handleTestToken = () => {
    setTokenTesting(true);
    setTimeout(() => {
      setTokenTesting(false);
      setToast('Hardware e-Token / HSM signature handshake verified: Level 3 Lending Delegation Active.');
      setTimeout(() => setToast(''), 4500);
    }, 1000);
  };

  return (
    <div className="tx-loan-profile-page">
      <PageHeader
        title="Credit Manager Professional Profile"
        subtitle="Manage credit delegation limits, syndicate banking connections, and department oversight parameters"
        breadcrumb={['Loan Domain', 'Profile', 'Credentials']}
      />

      {toast && (
        <div className="tx-profile-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="tx-profile-grid">
        <div className="tx-profile-card">
          <div className="tx-profile-banner">
            <div className="tx-profile-avatar">AD</div>
            <div>
              <h3 className="tx-profile-name">{profile.name}</h3>
              <span className="tx-profile-title">{profile.title}</span>
            </div>
            <div className="tx-credit-auth-badge">
              <Award size={16} />
              <span>Delegation Level 3</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="tx-profile-form">
            <div className="tx-form-row">
              <div className="tx-form-group">
                <label>Full Professional Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({ ...profile, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                />
                {errors.name && <span className="tx-field-error">{errors.name}</span>}
              </div>
              <div className="tx-form-group">
                <label>Single-Signoff Credit Delegation Cap *</label>
                <input
                  type="text"
                  value={profile.delegationLimit}
                  onChange={(e) => {
                    setProfile({ ...profile, delegationLimit: e.target.value });
                    if (errors.delegationLimit) setErrors({ ...errors, delegationLimit: null });
                  }}
                />
                {errors.delegationLimit && <span className="tx-field-error">{errors.delegationLimit}</span>}
              </div>
            </div>

            <div className="tx-form-row">
              <div className="tx-form-group">
                <label>Official Email *</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => {
                    setProfile({ ...profile, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                />
                {errors.email && <span className="tx-field-error">{errors.email}</span>}
              </div>
              <div className="tx-form-group">
                <label>Direct Contact Phone *</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile({ ...profile, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                />
                {errors.phone && <span className="tx-field-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="tx-form-group">
              <label>Integrated Syndicate Banking &amp; NBFC Partners</label>
              <input
                type="text"
                value={profile.partnerLenders}
                onChange={(e) => setProfile({ ...profile, partnerLenders: e.target.value })}
              />
            </div>

            <div className="tx-form-row">
              <div className="tx-form-group">
                <label>Jurisdiction Department</label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                />
              </div>
              <div className="tx-form-group">
                <label>Operational Office Hub</label>
                <input
                  type="text"
                  value={profile.office}
                  onChange={(e) => setProfile({ ...profile, office: e.target.value })}
                />
              </div>
            </div>

            {/* Hardware Token Verification Test */}
            <div className="tx-token-box">
              <div>
                <strong>HSM / Class 3 Digital Certificate Key</strong>
                <p>Status: Hardware DSC key registered &amp; valid until 31 Dec 2027.</p>
              </div>
              <button
                type="button"
                className="tx-btn-test-token"
                onClick={handleTestToken}
                disabled={tokenTesting}
              >
                <KeyRound size={14} />
                <span>{tokenTesting ? 'Testing Key...' : 'Verify DSC Handshake'}</span>
              </button>
            </div>

            <div className="tx-profile-footer">
              <button
                type="button"
                className="tx-btn-reset-profile"
                onClick={handleReset}
              >
                <RotateCcw size={14} />
                <span>Revert to Defaults</span>
              </button>
              <button type="submit" className="tx-btn-save-profile">
                <Save size={15} />
                <span>Save Lending Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
