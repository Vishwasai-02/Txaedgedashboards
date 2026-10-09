import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import Button from '../../../core/components/Button/Button';
import { authStore } from '../../../core/store/authStore';
import './ChatWindow.css';

interface ChatWindowProps {
  thread?: any;
  onSendMessage: (threadId: string, text: string) => void;
  currentUserId?: string;
}

export default function ChatWindow({ thread, onSendMessage, currentUserId }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeUserId = currentUserId || authStore.getUser()?.id || 'STAFF_USER';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread?.messages]);

  if (!thread) {
    return (
      <div className="tx-chat-window">
        <div className="tx-chat-messages-area empty">
          <p className="tx-muted-text">Select a discussion channel to view operational messages.</p>
        </div>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(thread.id, inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="tx-chat-window">
      <div className="tx-chat-header">
        <div className="tx-chat-recipient">
          <span className="tx-chat-recipient-name">{thread.participantName}</span>
          <span className="tx-chat-recipient-role">{thread.role}</span>
        </div>
      </div>

      <div className="tx-chat-messages-area">
        {(thread.messages || []).map((msg: any) => (
          <div
            key={msg.id}
            className={`tx-chat-bubble ${msg.sender === activeUserId ? 'sent' : 'received'}`}
          >
            <span>{msg.text}</span>
            <span className="tx-chat-time">{msg.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="tx-chat-input-bar" onSubmit={handleSend}>
        <input
          type="text"
          className="tx-chat-input"
          placeholder="Type message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <Button type="submit" variant="orange" icon={<Send size={16} />} disabled={!inputText.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
