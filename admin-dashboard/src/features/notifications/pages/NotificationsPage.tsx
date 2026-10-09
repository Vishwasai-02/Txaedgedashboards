import React, { useState, useEffect } from 'react';
import { CheckCheck, Trash2, CheckCircle2, Bell, AlertTriangle, CreditCard, X } from 'lucide-react';
import NotificationItem from '../components/NotificationItem';
import Button from '../../../core/components/Button/Button';
import { notificationsApi } from '../services/notificationsApi';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  const fetchNotifs = async () => {
    setLoading(true);
    const data = await notificationsApi.getNotifications();
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications(
      notifications.map((n: any) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAll = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
    showToast('All system notifications marked as read.', 'success');
  };

  const handleClearRead = () => {
    const unread = notifications.filter((n: any) => !n.read);
    const clearedCount = notifications.length - unread.length;
    setNotifications(unread);
    showToast(`Cleared ${clearedCount} read notification items.`, 'info');
  };

  const filteredNotifs = notifications.filter((notif: any) => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !notif.read;
    if (filter === 'SLA_ALERTS') return (notif.title || '').toLowerCase().includes('sla') || notif.type === 'ALERT';
    if (filter === 'PAYMENTS') return (notif.title || '').toLowerCase().includes('payment') || (notif.title || '').toLowerCase().includes('received');
    return true;
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="tx-notif-page">
      {feedback && (
        <div className={`tx-notif-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tx-notif-header">
        <div className="tx-notif-title">
          <h2>System Notifications &amp; Alerts</h2>
          <p>
            Real-time feed for document rejections, milestone updates, payments, and SLA warnings
          </p>
        </div>

        <div className="tx-notif-header-actions" style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            icon={<CheckCheck size={18} />}
            onClick={handleMarkAll}
            disabled={unreadCount === 0}
          >
            Mark All as Read ({unreadCount})
          </Button>
          <Button
            variant="secondary"
            icon={<Trash2 size={16} />}
            onClick={handleClearRead}
            disabled={notifications.filter((n) => n.read).length === 0}
          >
            Clear Read
          </Button>
        </div>
      </div>

      <div className="tx-notif-filter-bar" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button
          type="button"
          className={`tx-filter-pill ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          type="button"
          className={`tx-filter-pill ${filter === 'UNREAD' ? 'active' : ''}`}
          onClick={() => setFilter('UNREAD')}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          className={`tx-filter-pill ${filter === 'SLA_ALERTS' ? 'active' : ''}`}
          onClick={() => setFilter('SLA_ALERTS')}
        >
          SLA Escalations
        </button>
        <button
          type="button"
          className={`tx-filter-pill ${filter === 'PAYMENTS' ? 'active' : ''}`}
          onClick={() => setFilter('PAYMENTS')}
        >
          Payments &amp; Escrow
        </button>
      </div>

      <div className="tx-notif-card">
        {loading ? (
          <div className="tx-notif-empty">Loading notifications...</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="tx-notif-empty">
            <Bell size={36} color="var(--tx-muted-text)" style={{ marginBottom: '8px' }} />
            <p>No notifications in this view.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={handleRead}
            />
          ))
        )}
      </div>
    </div>
  );
}
