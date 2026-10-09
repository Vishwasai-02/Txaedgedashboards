import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  Plus,
  X,
  Search,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import Button from '../../../core/components/Button/Button';
import ChatWindow from '../../communication/components/ChatWindow';
import { loanManagerApi } from '../services/loanManagerApi';
import { staffCommunicationApi } from '../../communication/services/staffCommunicationApi';
import { STORAGE_KEYS } from '../../../core/store/sharedWorkflowStore';
import LoanAgentCard from '../components/LoanAgentCard';
import LoanAgentDetailsModal from '../components/LoanAgentDetailsModal';
import LoanAddAgentModal from '../components/LoanAddAgentModal';
import LoanRebalanceModal from '../components/LoanRebalanceModal';
import './LoanTeamPage.css';

export default function LoanTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedAgentDetails, setSelectedAgentDetails] = useState<any>(null);
  const [chatAgent, setChatAgent] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [transferTarget, setTransferTarget] = useState('Kavita Iyer');
  const [casesToTransfer, setCasesToTransfer] = useState(2);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  // Add agent modal state
  const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Business Loan Credit Executive',
    activeCases: 4
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Remove agent confirmation modal state
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    agent: any;
  }>({
    isOpen: false,
    agent: null
  });

  const loadTeam = () => {
    loanManagerApi.getTeam().then((data) => {
      setTeam(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTeam();
    const unsub = loanManagerApi.subscribe(() => loadTeam());
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
      recipientRole: 'LOAN_AGENT',
      text
    });
    const msgs = staffCommunicationApi.getDirectMessages(chatAgent.id);
    setChatMessages(msgs);
  };

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const openReassign = (member: any) => {
    setSelectedAgent(member);
    const otherMember = team.find((m) => m.id !== member.id);
    setTransferTarget(otherMember ? otherMember.name : 'Kavita Iyer');
    setCasesToTransfer(Math.min(2, member.activeCases || 1));
    setFormError('');
    setReassignModalOpen(true);
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    if (casesToTransfer < 1) {
      setFormError('Transfer count must be at least 1 case.');
      return;
    }
    if (casesToTransfer > selectedAgent.activeCases) {
      setFormError(`Cannot transfer more than active caseload (${selectedAgent.activeCases}).`);
      return;
    }
    if (selectedAgent.name === transferTarget) {
      setFormError('Target credit agent must be different from source agent.');
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
      `Rebalanced ${casesToTransfer} active loan files from ${selectedAgent.name} to ${transferTarget}.`,
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

    const created = await loanManagerApi.addAgent({
      name: newAgentForm.name.trim(),
      email: newAgentForm.email.trim(),
      phone: newAgentForm.phone.trim(),
      role: newAgentForm.role,
      activeCases: Number(newAgentForm.activeCases) || 0,
      department: 'Credit Underwriting & Syndicate'
    });

    loadTeam();
    setAddAgentModalOpen(false);
    setNewAgentForm({
      name: '',
      email: '',
      phone: '',
      role: 'Business Loan Credit Executive',
      activeCases: 4
    });
    setAddErrors({});
    showToast(`Loan Agent "${created.name}" onboarded to department successfully!`, 'success');
  };

  const handleConfirmRemoveAgent = async () => {
    if (!confirmDeleteModal.agent) return;
    await loanManagerApi.removeAgent(confirmDeleteModal.agent.id);
    loadTeam();
    if (selectedAgentDetails?.id === confirmDeleteModal.agent.id) {
      setSelectedAgentDetails(null);
    }
    showToast(`Credit agent "${confirmDeleteModal.agent.name}" removed from department.`, 'warning');
    setConfirmDeleteModal({ isOpen: false, agent: null });
  };

  const filteredTeam = team.filter((member) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      member.name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      member.id.toLowerCase().includes(q)
    );
  });

  const totalActiveCases = team.reduce((sum, m) => sum + (Number(m.activeCases) || 0), 0);
  const totalCompleted = team.reduce((sum, m) => sum + (Number(m.completedMonth) || 15), 0);

  return (
    <div className="tx-loan-team-page">
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
        subtitle="Supervise credit underwriting agents, appraisal caseload, turnaround benchmarks, and customer satisfaction"
        breadcrumb={['Loan Domain', 'Team', 'Agents']}
        badge={<span className="tx-team-badge">{team.length} Credit Underwriting Agents</span>}
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

      <div className="tx-agents-kpi-grid">
        <div className="tx-agent-kpi-card">
          <div className="tx-kpi-icon blue"><Users size={20} /></div>
          <div className="tx-kpi-info">
            <span className="tx-kpi-label">Active Credit Agents</span>
            <strong className="tx-kpi-val">{team.length}</strong>
            <span className="tx-kpi-sub">100% On-Duty</span>
          </div>
        </div>
        <div className="tx-agent-kpi-card">
          <div className="tx-kpi-icon orange"><FileCheck2 size={20} /></div>
          <div className="tx-kpi-info">
            <span className="tx-kpi-label">Active Loan Caseload</span>
            <strong className="tx-kpi-val">{totalActiveCases}</strong>
            <span className="tx-kpi-sub">Across All Underwriting</span>
          </div>
        </div>
        <div className="tx-agent-kpi-card">
          <div className="tx-kpi-icon green"><TrendingUp size={20} /></div>
          <div className="tx-kpi-info">
            <span className="tx-kpi-label">Sanctioned MTD</span>
            <strong className="tx-kpi-val">{totalCompleted}</strong>
            <span className="tx-kpi-sub">High Approval Rate</span>
          </div>
        </div>
        <div className="tx-agent-kpi-card">
          <div className="tx-kpi-icon navy"><Clock size={20} /></div>
          <div className="tx-kpi-info">
            <span className="tx-kpi-label">Avg Appraisal SLA</span>
            <strong className="tx-kpi-val">3.2 Days</strong>
            <span className="tx-kpi-sub">Benchmark: &lt; 4.0d</span>
          </div>
        </div>
      </div>

      <div className="tx-agents-controls-bar">
        <div className="tx-agents-search">
          <Search size={16} className="tx-search-icon" />
          <input
            type="text"
            placeholder="Search agents by name, ID, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="tx-clear-btn"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <span className="tx-agents-count-label">
          Showing {filteredTeam.length} of {team.length} Credit Executives
        </span>
      </div>

      <div className="tx-team-grid">
        {filteredTeam.length === 0 ? (
          <div className="tx-team-empty-state">
            <p>No credit agents found matching "{search}".</p>
            <button type="button" className="tx-btn-clear-filter" onClick={() => setSearch('')}>
              Clear Filter
            </button>
          </div>
        ) : (
          filteredTeam.map((member) => (
            <LoanAgentCard
              key={member.id}
              member={member}
              onViewDetails={(m) => setSelectedAgentDetails(m)}
              onMessage={(m) => setChatAgent(m)}
              onRebalance={(m) => openReassign(m)}
              onRemove={(m) => setConfirmDeleteModal({ isOpen: true, agent: m })}
            />
          ))
        )}
      </div>

      <LoanAgentDetailsModal
        agent={selectedAgentDetails}
        onClose={() => setSelectedAgentDetails(null)}
        onRemove={(agent) => setConfirmDeleteModal({ isOpen: true, agent })}
        onMessage={(agent) => {
          setSelectedAgentDetails(null);
          setChatAgent(agent);
        }}
      />

      <LoanAddAgentModal
        isOpen={addAgentModalOpen}
        onClose={() => setAddAgentModalOpen(false)}
        form={newAgentForm}
        setForm={setNewAgentForm}
        errors={addErrors}
        onSubmit={handleAddAgentSubmit}
      />

      <LoanRebalanceModal
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

      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={() => setConfirmDeleteModal({ isOpen: false, agent: null })}
        onConfirm={handleConfirmRemoveAgent}
        title="Remove Loan Agent"
        message={`Are you sure you want to decommission ${confirmDeleteModal.agent?.name} (${confirmDeleteModal.agent?.id}) from active underwriting duty? This action will remove the executive from the team roster.`}
        variant="danger"
        confirmText="Confirm Agent Removal"
      />

      {chatAgent && (
        <Modal
          isOpen={!!chatAgent}
          onClose={() => setChatAgent(null)}
          title={`Direct Communication — ${chatAgent.name} (Credit Agent)`}
        >
          <ChatWindow
            thread={{
              id: `DIRECT-${chatAgent.id}`,
              participantName: chatAgent.name,
              role: chatAgent.role || 'Credit Underwriting Executive',
              messages: chatMessages.map((m) => ({
                id: m.id,
                sender: m.senderId,
                text: m.text,
                time: m.time
              }))
            }}
            onSendMessage={handleSendChatMessage}
            currentUserId="MGR002"
          />
        </Modal>
      )}
    </div>
  );
}
