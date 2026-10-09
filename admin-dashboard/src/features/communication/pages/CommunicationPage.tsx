import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatThreadList from '../components/ChatThreadList';
import ChatWindow from '../components/ChatWindow';
import Button from '../../../core/components/Button/Button';
import { communicationApi } from '../services/communicationApi';
import './CommunicationPage.css';

export default function CommunicationPage() {
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [activeView, setActiveView] = useState('CHANNELS');
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [monitoringList, setMonitoringList] = useState<any[]>([]);

  const loadData = () => {
    communicationApi.getThreads(domainFilter).then((data: any) => {
      setThreads(data || []);
      if (data && data.length > 0) {
        setActiveThread((prev: any) => (prev ? data.find((t: any) => t.id === prev.id) || data[0] : data[0]));
      } else {
        setActiveThread(null);
      }
    });

    communicationApi.getAgentMonitoring(domainFilter).then((agents: any) => {
      setMonitoringList(agents || []);
    });
  };

  useEffect(() => {
    loadData();
    const unsub = communicationApi.subscribe(loadData);
    return () => {
      if (unsub) unsub();
    };
  }, [domainFilter]);

  const handleSendMessage = async (threadId: string, text: string) => {
    await communicationApi.sendMessage(threadId, text);
    const updated: any = await communicationApi.getThreads(domainFilter);
    setThreads(updated || []);
    const curr = (updated || []).find((t: any) => t.id === threadId);
    if (curr) setActiveThread(curr);
  };

  const handleOpenAgentChat = async (agent: any) => {
    // If agent domain is not included in current filter, set to ALL
    if (domainFilter !== 'ALL' && domainFilter !== agent.domain) {
      setDomainFilter('ALL');
    }
    const allThreads: any = await communicationApi.getThreads('ALL');
    const matched = (allThreads || []).find((t: any) => t.participantId === agent.id);
    if (matched) {
      setActiveThread(matched);
      setActiveView('CHANNELS');
    }
  };

  return (
    <div className="tx-comm-page">
      <div className="tx-comm-header">
        <div className="tx-comm-title">
          <h2>Executive Communication &amp; Team Monitoring</h2>
          <p>
            Bilateral management channels, domain hierarchy routing, and real-time agent operations monitoring
          </p>
        </div>

        <div className="tx-comm-controls-bar">
          <div className="tx-comm-domain-filters">
            <button
              type="button"
              className={`tx-filter-btn ${domainFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setDomainFilter('ALL')}
            >
              All Domains
            </button>
            <button
              type="button"
              className={`tx-filter-btn ${domainFilter === 'CA' ? 'active' : ''}`}
              onClick={() => setDomainFilter('CA')}
            >
              CA Domain
            </button>
            <button
              type="button"
              className={`tx-filter-btn ${domainFilter === 'LOAN' ? 'active' : ''}`}
              onClick={() => setDomainFilter('LOAN')}
            >
              Loan Domain
            </button>
          </div>

          <div className="tx-comm-view-switcher">
            <button
              type="button"
              className={`tx-view-tab-btn ${activeView === 'CHANNELS' ? 'active' : ''}`}
              onClick={() => setActiveView('CHANNELS')}
            >
              Management Channels
            </button>
            <button
              type="button"
              className={`tx-view-tab-btn ${activeView === 'MONITORING' ? 'active' : ''}`}
              onClick={() => setActiveView('MONITORING')}
            >
              Agent Monitoring ({monitoringList.length})
            </button>
          </div>
        </div>
      </div>

      {activeView === 'CHANNELS' ? (
        <div className="tx-comm-container">
          <ChatThreadList
            threads={threads}
            activeThreadId={activeThread?.id}
            onSelectThread={(t) => setActiveThread(t)}
          />
          <ChatWindow thread={activeThread} onSendMessage={handleSendMessage} currentUserId="ADM001" />
        </div>
      ) : (
        <div className="tx-agent-monitoring-container">
          <div className="tx-monitoring-header">
            <h3>Super Admin — Field Operations Monitoring</h3>
            <span className="tx-monitoring-count">{monitoringList.length} Monitored Agents</span>
          </div>
          <div className="tx-monitoring-table-wrapper">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Domain</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Current Application</th>
                  <th>Current Task</th>
                  <th>Last Activity</th>
                  <th>Connectivity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(monitoringList || []).map((agent: any) => (
                  <tr key={agent.id}>
                    <td>
                      <div className="tx-agent-name-cell">
                        <strong>{agent.name}</strong>
                        <span className="tx-agent-id-tag">{agent.id}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`tx-domain-badge ${agent.domain.toLowerCase()}`}>
                        {agent.domain}
                      </span>
                    </td>
                    <td>{agent.manager}</td>
                    <td>
                      <span className={`tx-status-badge ${agent.status.toLowerCase()}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td>
                      <span className="tx-monitored-app">{agent.currentApplication}</span>
                    </td>
                    <td>{agent.currentTask}</td>
                    <td className="tx-muted-text">{agent.lastActivity}</td>
                    <td>
                      <span className={`tx-online-pill ${agent.online ? 'online' : 'offline'}`}>
                        <span className="tx-online-dot" />
                        {agent.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="orange"
                        onClick={() => handleOpenAgentChat(agent)}
                        title={`Send direct bilateral instruction to ${agent.name}`}
                      >
                        <MessageSquare size={13} style={{ marginRight: '4px' }} />
                        Message
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
