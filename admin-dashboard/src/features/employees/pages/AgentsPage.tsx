import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import EmployeeList from '../components/EmployeeList';
import AddEmployeeForm from '../components/AddEmployeeForm';
import Modal from '../../../core/components/Modal/Modal';
import ConfirmationModal from '../../../core/components/ConfirmationModal/ConfirmationModal';
import Button from '../../../core/components/Button/Button';
import { employeesApi } from '../services/employeesApi';
import { ROLES } from '../../../core/constants/roles';
import ChatWindow from '../../communication/components/ChatWindow';
import { communicationApi } from '../../communication/services/communicationApi';
import './AgentsPage.css';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [activeChatAgent, setActiveChatAgent] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  // Status toggle confirmation
  const [confirmStatusModal, setConfirmStatusModal] = useState<{ isOpen: boolean; agent: any }>({
    isOpen: false,
    agent: null
  });

  // Password reset confirmation
  const [confirmResetModal, setConfirmResetModal] = useState<{ isOpen: boolean; agent: any }>({
    isOpen: false,
    agent: null
  });

  const fetchAgents = async () => {
    setLoading(true);
    const data = await employeesApi.getAgents();
    setAgents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
    const unsub = employeesApi.subscribe(() => fetchAgents());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    if (!activeChatAgent) return;
    const loadMessages = () => {
      const msgs = communicationApi.getDirectMessages(activeChatAgent.id);
      setChatMessages(msgs);
    };
    loadMessages();
    const unsub = communicationApi.subscribe(loadMessages);
    return () => {
      if (unsub) unsub();
    };
  }, [activeChatAgent]);

  const handleSendChatMessage = (threadId: string, text: string) => {
    if (!activeChatAgent) return;
    communicationApi.sendDirectMessage({
      recipientId: activeChatAgent.id,
      recipientName: activeChatAgent.name,
      recipientRole: activeChatAgent.domain === 'LOAN' ? 'LOAN_AGENT' : 'CA_AGENT',
      text
    });
    const msgs = communicationApi.getDirectMessages(activeChatAgent.id);
    setChatMessages(msgs);
  };

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreate = async (formData: any) => {
    await employeesApi.createEmployee(formData);
    setIsAddModalOpen(false);
    showToast(`Executive Agent "${formData.name}" added successfully!`, 'success');
  };

  const handleOpenEdit = (agent: any) => {
    setEditingAgent(agent);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (formData: any) => {
    if (!editingAgent) return;
    await employeesApi.updateEmployee(editingAgent.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      team: formData.team,
      managerName: formData.managerName
    });
    setIsEditModalOpen(false);
    showToast(`Executive profile for "${formData.name}" updated successfully.`, 'success');
  };

  const handlePromptToggleStatus = (agent: any) => {
    if (agent.status === 'ACTIVE') {
      setConfirmStatusModal({
        isOpen: true,
        agent
      });
    } else {
      executeToggleStatus(agent.id);
    }
  };

  const executeToggleStatus = async (id: string) => {
    await employeesApi.toggleStatus(id);
    const target = agents.find((a: any) => a.id === id);
    const newStatus = target?.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setConfirmStatusModal({ isOpen: false, agent: null });
    showToast(
      `Executive account ${id} is now ${newStatus.toLowerCase()}.`,
      newStatus === 'ACTIVE' ? 'success' : 'warning'
    );
  };

  const handlePromptResetPassword = (agent: any) => {
    setConfirmResetModal({
      isOpen: true,
      agent
    });
  };

  const executeResetPassword = async () => {
    if (!confirmResetModal.agent) return;
    const res = await employeesApi.resetPassword(confirmResetModal.agent.id);
    setConfirmResetModal({ isOpen: false, agent: null });
    showToast(res.message, 'info');
  };

  return (
    <div className="tx-agents-page">
      {feedback && (
        <div className={`tx-agents-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-agents-page-header">
        <div className="tx-agents-page-title">
          <h2>Operational Executives &amp; Agents</h2>
          <p>Manage tax preparers, loan specialists, case verification officers, and quotas</p>
        </div>
        <Button
          variant="orange"
          icon={<UserPlus size={18} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Executive / Agent
        </Button>
      </div>

      <EmployeeList
        employees={agents}
        roleType={ROLES.AGENT}
        onEditEmployee={handleOpenEdit}
        onToggleStatus={handlePromptToggleStatus}
        onResetPassword={handlePromptResetPassword}
        onMessageEmployee={(ag) => setActiveChatAgent(ag)}
      />

      {/* Add Agent Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Operational Executive / Agent"
      >
        <AddEmployeeForm
          roleType={ROLES.AGENT}
          onSubmit={handleCreate}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Agent Modal */}
      {editingAgent && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Executive Profile — ${editingAgent.name}`}
        >
          <AddEmployeeForm
            roleType={ROLES.AGENT}
            initialData={editingAgent}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}

      {/* Direct One-to-One Communication Modal */}
      {activeChatAgent && (
        <Modal
          isOpen={!!activeChatAgent}
          onClose={() => setActiveChatAgent(null)}
          title={`Direct Communication — ${activeChatAgent.name}`}
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
                  {activeChatAgent.name} ({activeChatAgent.id})
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {activeChatAgent.team} • Supervisor: {activeChatAgent.managerName || 'Operations Manager'}
                </div>
              </div>
              <div>
                <span
                  className="tx-emp-status-badge active"
                  style={{ fontSize: '11px', textTransform: 'uppercase' }}
                >
                  {activeChatAgent.domain} Field Executive
                </span>
              </div>
            </div>
            <ChatWindow
              thread={{
                id: `DIRECT-${activeChatAgent.id}`,
                participantName: activeChatAgent.name,
                role: `${activeChatAgent.domain} Operations Agent`,
                messages: chatMessages.map((m: any) => ({
                  id: m.id,
                  sender: m.senderId,
                  text: m.text,
                  time: m.time
                }))
              }}
              onSendMessage={handleSendChatMessage}
              currentUserId="ADM001"
            />
          </div>
        </Modal>
      )}

      {/* Disable Agent Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmStatusModal.isOpen}
        onClose={() => setConfirmStatusModal({ isOpen: false, agent: null })}
        onConfirm={() => executeToggleStatus(confirmStatusModal.agent?.id)}
        title="Disable Executive Account"
        message={`Are you sure you want to disable ${confirmStatusModal.agent?.name}? The agent will be unassigned from active filing queues.`}
        variant="danger"
        confirmText="Confirm Disable"
      />

      {/* Reset Password Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmResetModal.isOpen}
        onClose={() => setConfirmResetModal({ isOpen: false, agent: null })}
        onConfirm={executeResetPassword}
        title="Reset Agent Password"
        message={`Issue a password reset link to ${confirmResetModal.agent?.name} (${confirmResetModal.agent?.email})?`}
        variant="primary"
        confirmText="Send Reset Link"
      />
    </div>
  );
}
