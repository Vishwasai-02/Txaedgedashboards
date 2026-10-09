import React, { useState, useEffect } from 'react';
import { User, Award, ShieldCheck, Mail, Phone, Building, Save, CheckCircle2, Star, RotateCcw, AlertTriangle, MessageSquare } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import Modal from '../../../core/components/Modal/Modal';
import ChatWindow from '../../communication/components/ChatWindow';
import { staffCommunicationApi } from '../../communication/services/staffCommunicationApi';
import { authStore } from '../../../core/store/authStore';
import './AgentProfilePage.css';

const DEFAULT_PROFILE = {
  name: 'Suresh Kumar',
  designation: 'Senior Compliance & Filing Executive',
  department: 'CA & Direct/Indirect Tax Operations',
  supervisor: 'CA Sanjay Verma, FCA (Lead Manager)',
  email: 'suresh.k@taxedge.in',
  phone: '+91 98200 77123',
  desk: 'Station 12, Level 14, Lower Parel Hub',
  resolutionSpeed: '2.4 Days Avg',
  csat: '4.9 / 5.0 (98 reviews)'
};

export default function AgentProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [toast, setToast] = useState('');
  const [managerChatOpen, setManagerChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const currentUser = authStore.getUser();

  const managerId = currentUser?.domain === 'LOAN' ? 'MGR002' : 'MGR001';
  const managerName = currentUser?.domain === 'LOAN' ? 'Ananya Deshmukh' : 'Sanjay Verma';
  const managerRole = currentUser?.domain === 'LOAN' ? 'LOAN_MANAGER' : 'CA_MANAGER';

  useEffect(() => {
    if (!managerChatOpen) return;
    const loadChat = () => {
      const msgs = staffCommunicationApi.getDirectMessages(managerId);
      setChatMessages(msgs);
    };
    loadChat();
    const unsub = staffCommunicationApi.subscribe(loadChat);
    return () => {
      if (unsub) unsub();
    };
  }, [managerChatOpen, managerId]);

  const handleSendChatMessage = (threadId: string, text: string) => {
    if (!managerChatOpen) return;
    staffCommunicationApi.sendDirectMessage({
      recipientId: managerId,
      recipientName: managerName,
      recipientRole: managerRole,
      text
    });
    const msgs = staffCommunicationApi.getDirectMessages(managerId);
    setChatMessages(msgs);
  };

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
    if (!profile.department.trim()) {
      errs.department = 'Department name is mandatory.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setToast('Agent profile information updated successfully.');
    setTimeout(() => setToast(''), 4000);
  };

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
    setErrors({});
    setToast('Profile parameters reverted to default configuration.');
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <div className="tx-agent-profile-page">
      <PageHeader
        title="Executive Agent Professional Profile"
        subtitle="Operational role metrics, supervisor hierarchy, and contact parameters"
        breadcrumb={['Executive Operations', 'Profile', 'My Details']}
      />

      {toast && (
        <div className="tx-agent-prof-toast">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="tx-profile-grid">
        <div className="tx-profile-card">
          <div className="tx-profile-banner">
            <div className="tx-profile-avatar">SK</div>
            <div>
              <h3 className="tx-profile-name">{profile.name}</h3>
              <span className="tx-profile-title">{profile.designation}</span>
            </div>
            <div className="tx-csat-pill">
              <Star size={14} />
              <span>{profile.csat.split(' ')[0]} Star Performer</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="tx-profile-form">
            <div className="tx-form-row">
              <div className="tx-form-group">
                <label>Full Name *</label>
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
                <label>Designation</label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                />
              </div>
            </div>

            <div className="tx-form-row">
              <div className="tx-form-group">
                <label>Assigned Operations Manager / Supervisor</label>
                <input
                  type="text"
                  disabled
                  value={profile.supervisor}
                />
              </div>
              <div className="tx-form-group">
                <label>Operations Department *</label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => {
                    setProfile({ ...profile, department: e.target.value });
                    if (errors.department) setErrors({ ...errors, department: null });
                  }}
                />
                {errors.department && <span className="tx-field-error">{errors.department}</span>}
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
              <label>Office Station &amp; Location</label>
              <input
                type="text"
                value={profile.desk}
                onChange={(e) => setProfile({ ...profile, desk: e.target.value })}
              />
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
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Operational Communications & Escalation Dossier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Supervisor Bilateral Channel */}
          <div className="tx-profile-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#ffedd5',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                  Direct Supervisor Channel
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Bilateral case reviews &amp; filing queries
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Assigned Lead:</span>
                <strong style={{ fontSize: '12px', color: '#0f172a' }}>{managerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Role:</span>
                <span
                  className="tx-team-badge"
                  style={{ fontSize: '11px', textTransform: 'uppercase' }}
                >
                  {currentUser?.domain || 'CA'} Operations Manager
                </span>
              </div>
            </div>

            <button
              type="button"
              className="tx-btn-save-profile"
              style={{ width: '100%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => setManagerChatOpen(true)}
            >
              <MessageSquare size={14} style={{ marginRight: '6px' }} />
              <span>Message Supervisor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct One-to-One Communication Modal with Supervisor */}
      {managerChatOpen && (
        <Modal
          isOpen={managerChatOpen}
          onClose={() => setManagerChatOpen(false)}
          title={`Direct Communication — ${managerName} (${currentUser?.domain || 'CA'} Manager)`}
        >
          <div className="tx-direct-chat-modal-content">
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>
                  {managerName} ({managerId})
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {currentUser?.domain || 'CA'} Operations Manager • Direct Supervisor
                </div>
              </div>
              <div>
                <span
                  className="tx-team-badge"
                  style={{ fontSize: '11px', textTransform: 'uppercase' }}
                >
                  Supervisor
                </span>
              </div>
            </div>
            <ChatWindow
              thread={{
                id: `STH-${currentUser?.id}-MGR`,
                participantName: managerName,
                role: 'Direct Operations Manager',
                messages: chatMessages.map((m: any) => ({
                  id: m.id,
                  sender: m.senderId,
                  text: m.text,
                  time: m.time
                }))
              }}
              onSendMessage={handleSendChatMessage}
              currentUserId={currentUser?.id || 'AGT001'}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
