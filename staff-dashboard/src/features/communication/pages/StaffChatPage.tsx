import React, { useState, useEffect } from 'react';
import ChatThreadList from '../components/ChatThreadList';
import ChatWindow from '../components/ChatWindow';
import { staffCommunicationApi } from '../services/staffCommunicationApi';
import { useAuth } from '../../../core/hooks/useAuth';
import './StaffChatPage.css';

export default function StaffChatPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const isMgr = user?.role === 'MANAGER' || user?.role === 'CA_MANAGER' || user?.role === 'LOAN_MANAGER';
  const domainLabel = user?.domain === 'LOAN' ? 'Loan Operations' : 'CA Operations';

  useEffect(() => {
    setAccessError(null);
    const load = () => {
      staffCommunicationApi.getThreads().then((data: any[]) => {
        setThreads(data);
        if (data.length > 0) {
          setActiveThread((prev: any) => (prev ? data.find((t: any) => t.id === prev.id) || data[0] : data[0]));
        } else {
          setActiveThread(null);
        }
      });
    };
    load();
    const unsub = staffCommunicationApi.subscribe(load);
    return () => {
      if (unsub) unsub();
    };
  }, [user?.id, user?.domain]);

  const handleSelectThread = (thread: any) => {
    try {
      staffCommunicationApi.validateThreadAccess(thread.id, user);
      setAccessError(null);
      setActiveThread(thread);
    } catch (err: any) {
      setAccessError(err.message || 'Access error');
    }
  };

  const handleSendMessage = async (threadId: string, text: string) => {
    try {
      await staffCommunicationApi.sendMessage(threadId, text);
      const updated = await staffCommunicationApi.getThreads();
      setThreads(updated);
      const curr = updated.find((t: any) => t.id === threadId);
      if (curr) setActiveThread(curr);
    } catch (err: any) {
      setAccessError(err.message || 'Error sending message');
    }
  };

  return (
    <div className="tx-comm-page">
      <div className="tx-comm-header">
        <div className="tx-comm-title">
          <h2>{domainLabel} — Team Communication</h2>
          <p>
            {isMgr
              ? `Direct bilateral channel with assigned ${user?.domain || 'CA'} executives`
              : `Operational escalation channel with ${user?.domain || 'CA'} Case Manager`}
          </p>
        </div>
        <div className="tx-comm-meta-badge">
          <span className="tx-comm-domain-tag">{user?.domain || 'CA'} DOMAIN</span>
          <span className="tx-comm-role-tag">{user?.role}</span>
        </div>
      </div>

      {accessError && (
        <div className="tx-comm-access-alert" role="alert">
          <strong>Access Denied:</strong> {accessError}
        </div>
      )}

      <div className="tx-comm-container">
        <ChatThreadList
          threads={threads}
          activeThreadId={activeThread?.id}
          onSelectThread={handleSelectThread}
        />
        <ChatWindow thread={activeThread} onSendMessage={handleSendMessage} currentUserId={user?.id} />
      </div>
    </div>
  );
}
