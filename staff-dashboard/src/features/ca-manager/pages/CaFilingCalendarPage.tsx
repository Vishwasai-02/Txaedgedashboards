import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertCircle,
  Clock,
  BellRing,
  Send,
  CheckCircle2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  X,
  Users
} from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader/PageHeader';
import PriorityBadge from '../../../core/components/PriorityBadge/PriorityBadge';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';
import { caManagerApi } from '../services/caManagerApi';
import './CaFilingCalendarPage.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CaFilingCalendarPage() {
  const [calendarItems, setCalendarItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // October 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    caManagerApi.getFilingCalendar().then((data) => {
      setCalendarItems(data);
      setLoading(false);
    });
  }, []);

  const showToast = (message: string, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleSendReminders = (item: any) => {
    showToast(
      `Automated compliance dispatch sent to ${item.clientsAffected} active clients for ${item.form}.`,
      'success'
    );
    if (selectedEvent) setSelectedEvent(null);
  };

  const filteredItems = calendarItems.filter((item: any) => {
    if (selectedCategory === 'ALL') return true;
    return item.category.toUpperCase().includes(selectedCategory);
  });

  return (
    <div className="tx-ca-calendar-page">
      {feedback && (
        <div className={`tx-cal-feedback-toast ${feedback.type}`}>
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
          <button type="button" className="tx-close-toast" onClick={() => setFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <PageHeader
        title="Statutory Filing & Compliance Calendar"
        subtitle="Mandatory due dates for GST, Income Tax Advance Installments, TCS, and MCA ROC Returns"
        breadcrumb={['CA Domain', 'Compliance', 'Filing Calendar']}
        badge={<span className="tx-cal-badge">FY 2026-27</span>}
        actions={
          <div className="tx-cal-month-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button type="button" className="tx-month-nav-btn" onClick={handlePrevMonth} title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: '700', fontSize: '14px', minWidth: '130px', textAlign: 'center' }}>
              {MONTH_NAMES[currentMonthIndex]} {currentYear}
            </span>
            <button type="button" className="tx-month-nav-btn" onClick={handleNextMonth} title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      <div className="tx-calendar-controls">
        <div className="tx-cal-filter-pills">
          <button
            type="button"
            className={`tx-cal-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Deadlines ({calendarItems.length})
          </button>
          <button
            type="button"
            className={`tx-cal-pill ${selectedCategory === 'GST' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('GST')}
          >
            GST Returns
          </button>
          <button
            type="button"
            className={`tx-cal-pill ${selectedCategory === 'TAX' || selectedCategory === 'DIRECT' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('TAX')}
          >
            Direct Tax (TDS/ITR)
          </button>
          <button
            type="button"
            className={`tx-cal-pill ${selectedCategory === 'ROC' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ROC')}
          >
            MCA &amp; ROC Filings
          </button>
        </div>
      </div>

      <div className="tx-calendar-grid">
        {filteredItems.map((item: any) => (
          <div key={item.id} className="tx-cal-event-card">
            <div className="tx-cal-event-header">
              <div className="tx-cal-date-chip">
                <span className="tx-cal-day">{item.dueDate.split(' ')[0]}</span>
                <span className="tx-cal-month">{item.dueDate.split(' ')[1]}</span>
              </div>
              <div className="tx-cal-header-meta">
                <span className="tx-cal-category">{item.category}</span>
                <h3 className="tx-cal-form-title">{item.form}</h3>
              </div>
              <PriorityBadge priority={item.priority || 'HIGH'} />
            </div>

            <p className="tx-cal-description">{item.description}</p>

            <div className="tx-cal-footer">
              <button
                type="button"
                className="tx-cal-affected-btn"
                onClick={() => setSelectedEvent(item)}
                title="Inspect affected clients"
              >
                <Users size={14} />
                <span>{item.clientsAffected} Clients Affected</span>
              </button>
              <button
                type="button"
                className="tx-btn-remind"
                onClick={() => handleSendReminders(item)}
                title="Dispatch Compliance Ping"
              >
                <Send size={13} />
                <span>Remind</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Affected Clients Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={`Affected Client Accounts — ${selectedEvent.form}`}
        >
          <div className="tx-affected-modal-body">
            <p style={{ fontSize: '13px', color: 'var(--tx-secondary-text)', marginBottom: '16px' }}>
              Statutory deadline <strong>{selectedEvent.dueDate}</strong> applies to the following{' '}
              <strong>{selectedEvent.clientsAffected} registered client entities</strong>:
            </p>

            <div className="tx-affected-clients-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              <div className="tx-affected-item" style={{ padding: '10px', background: 'var(--tx-background)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>Apex Engineering Pvt Ltd</strong>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--tx-secondary-text)' }}>GSTIN: 27AAACT9988C1ZR • Assigned: Suresh Kumar</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#E65100' }}>PENDING DOCS</span>
              </div>
              <div className="tx-affected-item" style={{ padding: '10px', background: 'var(--tx-background)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>Zenith Techworks LLP</strong>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--tx-secondary-text)' }}>GSTIN: 27AABCT4411D1Z2 • Assigned: Priya Sharma</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1565C0' }}>DRAFT READY</span>
              </div>
              <div className="tx-affected-item" style={{ padding: '10px', background: 'var(--tx-background)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>Horizon Healthcare Diagnostics</strong>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--tx-secondary-text)' }}>GSTIN: 27AACCH8812E1Z8 • Assigned: Rahul Dave</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#E65100' }}>EVC PENDING</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              <Button
                variant="orange"
                icon={<Send size={15} />}
                onClick={() => handleSendReminders(selectedEvent)}
              >
                Send Bulk Reminders
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
