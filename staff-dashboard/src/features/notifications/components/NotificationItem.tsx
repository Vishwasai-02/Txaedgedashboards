import React from 'react';
import { AlertCircle, CheckCircle, CreditCard, Clock } from 'lucide-react';
import './NotificationItem.css';

import { NotificationItemData } from '../../../shared/types/workflowTypes';

interface NotificationItemProps {
  notification: NotificationItemData;
  onRead?: (id: string) => void;
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'ALERT':
        return <AlertCircle size={18} />;
      case 'PAYMENT':
        return <CreditCard size={18} />;
      case 'SUCCESS':
        return <CheckCircle size={18} />;
      case 'WARNING':
        return <Clock size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  return (
    <div
      className={`tx-notif-item ${notification.read ? 'read' : 'unread'}`}
      onClick={() => onRead && onRead(notification.id)}
    >
      <div className={`tx-notif-icon-box ${(notification.type || 'info').toLowerCase()}`}>
        {getIcon()}
      </div>
      <div className="tx-notif-content">
        <div className="tx-notif-top">
          <span className="tx-notif-title">{notification.title}</span>
          <span className="tx-notif-time">{notification.time}</span>
        </div>
        <p className="tx-notif-msg">{notification.message}</p>
        <div className="tx-notif-meta">
          <span className="tx-notif-app-ref">Case: {notification.applicationId}</span>
        </div>
      </div>
    </div>
  );
}
