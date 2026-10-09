import React from 'react';
import './ChatThreadList.css';

interface ChatThreadListProps {
  threads?: any[];
  activeThreadId?: string;
  onSelectThread: (thread: any) => void;
}

export default function ChatThreadList({ threads = [], activeThreadId, onSelectThread }: ChatThreadListProps) {
  return (
    <div className="tx-thread-list">
      <div className="tx-thread-list-header">Team &amp; Admin Messages</div>
      <div className="tx-thread-items">
        {threads.map((thread: any) => {
          const initials = (thread.participantName || '')
            .split(' ')
            .map((n: string) => n[0])
            .slice(0, 2)
            .join('');

          return (
            <div
              key={thread.id}
              className={`tx-thread-item ${activeThreadId === thread.id ? 'active' : ''}`}
              onClick={() => onSelectThread(thread)}
            >
              <div className="tx-thread-avatar">{initials}</div>
              <div className="tx-thread-details">
                <div className="tx-thread-row-top">
                  <span className="tx-thread-name">{thread.participantName}</span>
                  <span className="tx-thread-time">{thread.lastMessageTime}</span>
                </div>
                <span className="tx-thread-preview">{thread.lastMessage}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
