import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, X } from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import Button from '../../../core/components/Button/Button';
import ChatWindow from '../../communication/components/ChatWindow';
import { caManagerApi } from '../services/caManagerApi';
import { staffCommunicationApi } from '../../communication/services/staffCommunicationApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import CaAgentCard from '../components/CaAgentCard';
import CaAgentDetailsModal from '../components/CaAgentDetailsModal';
import CaAddAgentModal from '../components/CaAddAgentModal';
import CaRebalanceModal from '../components/CaRebalanceModal';
import './CaTeamPage.css';

export default function CaTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedAgentDetails, setSelectedAgentDetails] = useState<any>(null);
  const [chatAgent, setChatAgent] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [transferTarget, setTransferTarget] = useState('Priya Sharma');
  const [casesToTransfer, setCasesToTransfer] = useState(2);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  // Add agent state
  const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Direct Tax Executive',
    activeCases: 4
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Remove agent confirmation state
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    agent: any;
  }>({
    isOpen: false,
    agent: null
  });

  const loadTeam = () => {
    caManagerApi.getTeam().then((data) => {
      setTeam(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTeam();
    const unsub = caManagerApi.subscribe(STORAGE_KEYS.EMPLOYEES, () => loadTeam());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    if (!chatAgent) return;
    const loadChat = () => {
      const msgs = staffCommunicationApi.getDirectMessages(chatAgent.id);
      setChatMessages(msgs);
    };
    loadChat();
    const unsub = staffCommunicationApi.subscribe(loadChat);
    return () => {
      if (unsub) unsub();
    };
  }, [chatAgent]);

  const handleSendChatMessage = (threadId: string, text: string) => {
    if (!chatAgent) return;
    staffCommunicationApi.sendDirectMessage({
      recipientId: chatAgent.id,
      recipientName: chatAgent.name,
      recipientRole: 'CA_AGENT',
      text
    });
    const msgs = staffCommunicationApi.getDirectMessages(chatAgent.id);
    setChatMessages(msgs);
  };

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const openReassign = (agent: any) => {
    setSelectedAgent(agent);
    const otherAgent = team.find((a) => a.id !== agent.id)?.name || 'Priya Sharma';
    setTransferTarget(otherAgent);
    setCasesToTransfer(Math.min(2, agent.activeCases || 2));
    setFormError('');
    setReassignModalOpen(true);
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    if (casesToTransfer <= 0) {
      setFormError('Transfer count must be at least 1 case.');
      return;
    }
    if (casesToTransfer > selectedAgent.activeCases) {
      setFormError(`Cannot transfer more than active caseload (${selectedAgent.activeCases}).`);
      return;
    }
    if (selectedAgent.name === transferTarget) {
      setFormError('Target agent must be different from source agent.');
      return;
    }

    const updated = team.map((member) => {
      if (member.id === selectedAgent.id) {
        return { ...member, activeCases: Math.max(0, member.activeCases - casesToTransfer) };
      }
      if (member.name === transferTarget) {
        return { ...member, activeCases: member.activeCases + casesToTransfer };
      }
      return member;
    });

    setTeam(updated);
    setReassignModalOpen(false);
    showToast(
      `Rebalanced ${casesToTransfer} active filing cases from ${selectedAgent.name} to ${transferTarget}.`,
      'success'
    );
  };

  const validateAddAgent = () => {
    const errs: Record<string, string> = {};
    if (!newAgentForm.name.trim() || newAgentForm.name.trim().length < 3) {
      errs.name = 'Agent full name must be at least 3 characters.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAgentForm.email.trim())) {
      errs.email = 'Enter a valid corporate email.';
    }
    const phoneClean = newAgentForm.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      errs.phone = 'Enter a valid 10-digit mobile number.';
    }
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddAgent()) return;

    const created = await caManagerApi.addAgent({
      name: newAgentForm.name.trim(),
      email: newAgentForm.email.trim(),
      phone: newAgentForm.phone.trim(),
      role: newAgentForm.role,
      activeCases: Number(newAgentForm.activeCases) || 0,
      department: 'CA Operations & Statutory Filing'
    });

    loadTeam();
    setAddAgentModalOpen(false);
    setNewAgentForm({
      name: '',
      email: '',
      phone: '',
      role: 'Direct Tax Executive',
      activeCases: 4
    });
    setAddErrors({});
    showToast(`CA Agent "${created.name}" onboarded to department successfully!`, 'success');
  };

  const handleConfirmRemoveAgent = async () => {
    if (!confirmDeleteModal.agent) return;
    await caManagerApi.removeAgent(confirmDeleteModal.agent.id);
    loadTeam();
    if (selectedAgentDetails?.id === confirmDeleteModal.agent.id) {
      setSelectedAgentDetails(null);
    }
    showToast(`Agent "${confirmDeleteModal.agent.name}" removed from department.`, 'warning');
    setConfirmDeleteModal({ isOpen: false, agent: null });
  };

  return (
    <div className="tx-ca-team-page">
      {feedback && (
        <div className={`tx-team-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <PageHeader
        title="Agents"
        subtitle="Monitor agent case allocation, filing efficiency, resolution benchmarks, and satisfaction ratings"
        breadcrumb={['CA Domain', 'Team', 'Agents']}
        badge={<span className="tx-team-badge">{team.length} Filing Executives</span>}
        actions={
          <Button
            variant="orange"
            onClick={() => {
              setAddErrors({});
              setAddAgentModalOpen(true);
            }}
          >
            <Plus size={16} style={{ marginRight: '6px' }} />
            <span>Add New Agent</span>
          </Button>
        }
      />

      <div className="tx-team-grid">
        {team.map((member) => (
          <CaAgentCard
            key={member.id}
            member={member}
            onViewDetails={(m) => setSelectedAgentDetails(m)}
            onMessage={(m) => setChatAgent(m)}
            onRebalance={(m) => openReassign(m)}
            onRemove={(m) => setConfirmDeleteModal({ isOpen: true, agent: m })}
          />
        ))}
      </div>

      <CaAgentDetailsModal
        agent={selectedAgentDetails}
        onClose={() => setSelectedAgentDetails(null)}
        onRemove={(agent) => setConfirmDeleteModal({ isOpen: true, agent })}
        onMessage={(agent) => {
          setSelectedAgentDetails(null);
          setChatAgent(agent);
        }}
      />

      <CaAddAgentModal
        isOpen={addAgentModalOpen}
        onClose={() => setAddAgentModalOpen(false)}
        form={newAgentForm}
        setForm={setNewAgentForm}
        errors={addErrors}
        onSubmit={handleAddAgentSubmit}
      />

      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={() => setConfirmDeleteModal({ isOpen: false, agent: null })}
        onConfirm={handleConfirmRemoveAgent}
        title="Remove CA Agent"
        message={`Are you sure you want to remove ${confirmDeleteModal.agent?.name} (${confirmDeleteModal.agent?.id}) from the CA Operations department? This action will reassign all pending files.`}
        variant="danger"
        confirmText="Confirm Remove Agent"
      />

      <CaRebalanceModal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        selectedAgent={selectedAgent}
        team={team}
        casesToTransfer={casesToTransfer}
        setCasesToTransfer={setCasesToTransfer}
        transferTarget={transferTarget}
        setTransferTarget={setTransferTarget}
        formError={formError}
        onSubmit={handleReassignSubmit}
      />

      {chatAgent && (
        <Modal
          isOpen={!!chatAgent}
          onClose={() => setChatAgent(null)}
          title={`Direct Communication — ${chatAgent.name}`}
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
                  {chatAgent.name} ({chatAgent.id})
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {chatAgent.role} • Active Caseload: {chatAgent.activeCases}
                </div>
              </div>
              <div>
                <span
                  className="tx-team-badge"
                  style={{ fontSize: '11px', textTransform: 'uppercase' }}
                >
                  Direct Report Agent
                </span>
              </div>
            </div>
            <ChatWindow
              thread={{
                id: `DIRECT-${chatAgent.id}`,
                participantName: chatAgent.name,
                role: chatAgent.role,
                messages: chatMessages.map((m) => ({
                  id: m.id,
                  sender: m.senderId,
                  text: m.text,
                  time: m.time
                }))
              }}
              onSendMessage={handleSendChatMessage}
              currentUserId="MGR001"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
