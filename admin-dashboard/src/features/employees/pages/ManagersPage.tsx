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
import './ManagersPage.css';

export default function ManagersPage() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<any>(null);
  const [activeChatManager, setActiveChatManager] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  // Status toggle confirmation
  const [confirmStatusModal, setConfirmStatusModal] = useState<{ isOpen: boolean; manager: any }>({
    isOpen: false,
    manager: null
  });

  // Password reset confirmation
  const [confirmResetModal, setConfirmResetModal] = useState<{ isOpen: boolean; manager: any }>({
    isOpen: false,
    manager: null
  });

  const fetchManagers = async () => {
    setLoading(true);
    const data = await employeesApi.getManagers();
    setManagers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchManagers();
    const unsub = employeesApi.subscribe(() => fetchManagers());
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    if (!activeChatManager) return;
    const loadMessages = () => {
      const msgs = communicationApi.getDirectMessages(activeChatManager.id);
      setChatMessages(msgs);
    };
    loadMessages();
    const unsub = communicationApi.subscribe(loadMessages);
    return () => {
      if (unsub) unsub();
    };
  }, [activeChatManager]);

  const handleSendChatMessage = (threadId: string, text: string) => {
    if (!activeChatManager) return;
    communicationApi.sendDirectMessage({
      recipientId: activeChatManager.id,
      recipientName: activeChatManager.name,
      recipientRole: activeChatManager.domain === 'LOAN' ? 'LOAN_MANAGER' : 'CA_MANAGER',
      text
    });
    const msgs = communicationApi.getDirectMessages(activeChatManager.id);
    setChatMessages(msgs);
  };

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreate = async (formData: any) => {
    await employeesApi.createEmployee(formData);
    setIsAddModalOpen(false);
    showToast(`Department Manager "${formData.name}" appointed successfully!`, 'success');
  };

  const handleOpenEdit = (manager: any) => {
    setEditingManager(manager);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (formData: any) => {
    if (!editingManager) return;
    await employeesApi.updateEmployee(editingManager.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      team: formData.team
    });
    setIsEditModalOpen(false);
    showToast(`Manager profile for "${formData.name}" updated successfully.`, 'success');
  };

  const handlePromptToggleStatus = (manager: any) => {
    if (manager.status === 'ACTIVE') {
      setConfirmStatusModal({
        isOpen: true,
        manager
      });
    } else {
      executeToggleStatus(manager.id);
    }
  };

  const executeToggleStatus = async (id: string) => {
    await employeesApi.toggleStatus(id);
    const target = managers.find((m: any) => m.id === id);
    const newStatus = target?.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setConfirmStatusModal({ isOpen: false, manager: null });
    showToast(
      `Manager account ${id} is now ${newStatus.toLowerCase()}.`,
      newStatus === 'ACTIVE' ? 'success' : 'warning'
    );
  };

  const handlePromptResetPassword = (manager: any) => {
    setConfirmResetModal({
      isOpen: true,
      manager
    });
  };

  const executeResetPassword = async () => {
    if (!confirmResetModal.manager) return;
    const res = await employeesApi.resetPassword(confirmResetModal.manager.id);
    setConfirmResetModal({ isOpen: false, manager: null });
    showToast(res.message, 'info');
  };

  return (
    <div className="tx-emp-page">
      {feedback && (
        <div className={`tx-emp-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-emp-page-header">
        <div className="tx-emp-page-title">
          <h2>Department Managers</h2>
          <p>Supervise division leads, workload assignments, and team authorizations</p>
        </div>
        <Button
          variant="orange"
          icon={<UserPlus size={18} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Manager
        </Button>
      </div>

      <EmployeeList
        employees={managers}
        roleType={ROLES.MANAGER}
        onEditEmployee={handleOpenEdit}
        onToggleStatus={handlePromptToggleStatus}
        onResetPassword={handlePromptResetPassword}
        onMessageEmployee={(mgr) => setActiveChatManager(mgr)}
      />

      {/* Add Manager Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Department Manager"
      >
        <AddEmployeeForm
          roleType={ROLES.MANAGER}
          onSubmit={handleCreate}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Manager Modal */}
      {editingManager && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Manager Profile — ${editingManager.name}`}
        >
          <AddEmployeeForm
            roleType={ROLES.MANAGER}
            initialData={editingManager}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}

      {/* Direct One-to-One Communication Modal */}
      {activeChatManager && (
        <Modal
          isOpen={!!activeChatManager}
          onClose={() => setActiveChatManager(null)}
          title={`Direct Communication — ${activeChatManager.name}`}
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
                  {activeChatManager.name} ({activeChatManager.id})
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {activeChatManager.team} • {activeChatManager.email}
                </div>
              </div>
              <div>
                <span
                  className="tx-emp-status-badge active"
                  style={{ fontSize: '11px', textTransform: 'uppercase' }}
                >
                  {activeChatManager.domain} Department Lead
                </span>
              </div>
            </div>
            <ChatWindow
              thread={{
                id: `DIRECT-${activeChatManager.id}`,
                participantName: activeChatManager.name,
                role: `${activeChatManager.domain} Department Manager`,
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

      {/* Disable Manager Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmStatusModal.isOpen}
        onClose={() => setConfirmStatusModal({ isOpen: false, manager: null })}
        onConfirm={() => executeToggleStatus(confirmStatusModal.manager?.id)}
        title="Disable Manager Account"
        message={`Are you sure you want to disable ${confirmStatusModal.manager?.name}? This manager will temporarily lose system access.`}
        variant="danger"
        confirmText="Confirm Disable"
      />

      {/* Reset Password Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmResetModal.isOpen}
        onClose={() => setConfirmResetModal({ isOpen: false, manager: null })}
        onConfirm={executeResetPassword}
        title="Reset Temporary Password"
        message={`Issue a password reset link to ${confirmResetModal.manager?.name} (${confirmResetModal.manager?.email})?`}
        variant="primary"
        confirmText="Send Reset Link"
      />
    </div>
  );
}
