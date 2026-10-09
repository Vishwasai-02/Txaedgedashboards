import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import DataTable from '../../../core/components/DataTable/DataTable';
import Button from '../../../core/components/Button/Button';
import Modal from '../../../core/components/Modal/Modal';
import ChatWindow from '../../communication/components/ChatWindow';
import { staffCommunicationApi } from '../../communication/services/staffCommunicationApi';
import { authStore } from '../../../core/store/authStore';
import './TeamMonitoringTable.css';

export interface TeamMonitoringTableProps {
  team?: any[];
  loading?: boolean;
}

export default function TeamMonitoringTable({ team = [], loading = false }: TeamMonitoringTableProps) {
  const [activeChatAgent, setActiveChatAgent] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const currentUser = authStore.getUser();

  useEffect(() => {
    if (!activeChatAgent) return;
    const loadChat = () => {
      const msgs = staffCommunicationApi.getDirectMessages(activeChatAgent.id);
      setChatMessages(msgs);
    };
    loadChat();
    const unsub = staffCommunicationApi.subscribe(loadChat);
    return () => {
      if (unsub) unsub();
    };
  }, [activeChatAgent]);

  const handleSendChatMessage = (threadId: string, text: string) => {
    if (!activeChatAgent) return;
    const isLoan = currentUser?.domain === 'LOAN';
    staffCommunicationApi.sendDirectMessage({
      recipientId: activeChatAgent.id,
      recipientName: activeChatAgent.name,
      recipientRole: isLoan ? 'LOAN_AGENT' : 'CA_AGENT',
      text
    });
    const msgs = staffCommunicationApi.getDirectMessages(activeChatAgent.id);
    setChatMessages(msgs);
  };

  const columns = [
    {
      header: 'Agent ID',
      key: 'id'
    },
    {
      header: 'Executive Name',
      key: 'name',
      render: (row: any) => <span className="tx-team-agent-name">{row.name}</span>
    },
    {
      header: 'Active Cases Under Work',
      key: 'activeCases',
      render: (row: any) => <strong>{row.activeCases}</strong>
    },
    {
      header: 'Completed Today',
      key: 'completedToday',
      render: (row: any) => <span>{row.completedToday} filings</span>
    },
    {
      header: 'Avg Turnaround',
      key: 'avgTurnaround'
    },
    {
      header: 'Performance Rating',
      key: 'rating',
      render: (row: any) => <span className="tx-team-rating">★ {row.rating}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row: any) => (
        <Button
          size="sm"
          variant="orange"
          onClick={() => setActiveChatAgent(row)}
          title={`Direct message with ${row.name}`}
        >
          <MessageSquare size={13} style={{ marginRight: '4px' }} />
          Message
        </Button>
      )
    }
  ];

  return (
    <div className="tx-team-table-card">
      <DataTable
        columns={columns}
        data={team}
        loading={loading}
        searchPlaceholder="Search agent performance..."
        searchField="name"
      />

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
                  Active Cases: {activeChatAgent.activeCases} • Turnaround: {activeChatAgent.avgTurnaround || '2.4d'}
                </div>
              </div>
              <div>
                <span
                  className="tx-team-badge"
                  style={{ fontSize: '11px', textTransform: 'uppercase' }}
                >
                  Direct Team Member
                </span>
              </div>
            </div>
            <ChatWindow
              thread={{
                id: `DIRECT-${activeChatAgent.id}`,
                participantName: activeChatAgent.name,
                role: 'Assigned Executive Agent',
                messages: chatMessages.map((m: any) => ({
                  id: m.id,
                  sender: m.senderId,
                  text: m.text,
                  time: m.time
                }))
              }}
              onSendMessage={handleSendChatMessage}
              currentUserId={currentUser?.id || 'MGR001'}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
