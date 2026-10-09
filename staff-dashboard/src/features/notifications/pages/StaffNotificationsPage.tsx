import React, { useState, useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import NotificationItem from '../components/NotificationItem';
import Button from '../../../core/components/Button/Button';
import { staffNotificationsApi } from '../services/staffNotificationsApi';
import { NotificationItemData } from '../../../shared/types/workflowTypes';
import './StaffNotificationsPage.css';

export default function StaffNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    const data = await staffNotificationsApi.getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleRead = async (id: string) => {
    await staffNotificationsApi.markAsRead(id);
    fetchNotifs();
  };

  const handleMarkAll = async () => {
    await staffNotificationsApi.markAllAsRead();
    fetchNotifs();
  };

  return (
    <div className="tx-notif-page">
      <div className="tx-notif-header">
        <div className="tx-notif-title">
          <h2>Staff Operational Notifications</h2>
          <p>Task assignments, document uploads, customer replies, and deadline notifications</p>
        </div>
        <Button variant="secondary" icon={<CheckCheck size={18} />} onClick={handleMarkAll}>
          Mark All as Read
        </Button>
      </div>

      <div className="tx-notif-card">
        {loading ? (
          <div className="tx-notif-empty">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="tx-notif-empty">No notifications found.</div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem key={notif.id} notification={notif} onRead={handleRead} />
          ))
        )}
      </div>
    </div>
  );
}
