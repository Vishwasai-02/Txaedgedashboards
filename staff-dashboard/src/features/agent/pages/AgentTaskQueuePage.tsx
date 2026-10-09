import React, { useState, useEffect } from 'react';
import TaskQueueTable from '../components/TaskQueueTable';
import { agentApi } from '../services/agentApi';
import { useAuth } from '../../../core/hooks/useAuth';
import './AgentTaskQueuePage.css';

export default function AgentTaskQueuePage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadTasks = () => {
    agentApi.getTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    loadTasks();
    const unsubscribe = agentApi.subscribe(() => {
      loadTasks();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id, user?.domain]);

  const filteredTasks = tasks.filter((task: any) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'HIGH') return task.priority === 'HIGH' || task.priority === 'URGENT';
    if (activeFilter === 'IN_PROGRESS') return task.status === 'IN_PROGRESS' || task.status === 'PROCESSING' || task.status === 'ASSIGNED';
    if (activeFilter === 'REWORK') return task.status === 'REWORK_REQUIRED';
    if (activeFilter === 'REVIEW') return task.status === 'PENDING_REVIEW';
    if (activeFilter === 'COMPLETED') return task.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="tx-agent-queue-page">
      <div className="tx-agent-header">
        <div className="tx-agent-title">
          <h2>My Assigned Task Queue</h2>
          <p>Prioritized operational workload, filing deadlines, and client cases assigned to you</p>
        </div>
      </div>

      <div className="tx-agent-filters">
        <button
          type="button"
          className={`tx-filter-chip ${activeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveFilter('ALL')}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          type="button"
          className={`tx-filter-chip ${activeFilter === 'HIGH' ? 'active' : ''}`}
          onClick={() => setActiveFilter('HIGH')}
        >
          High Priority ({tasks.filter((t: any) => t.priority === 'HIGH' || t.priority === 'URGENT').length})
        </button>
        <button
          type="button"
          className={`tx-filter-chip ${activeFilter === 'IN_PROGRESS' ? 'active' : ''}`}
          onClick={() => setActiveFilter('IN_PROGRESS')}
        >
          In Progress ({tasks.filter((t: any) => t.status === 'IN_PROGRESS' || t.status === 'PROCESSING' || t.status === 'ASSIGNED').length})
        </button>
        <button
          type="button"
          className={`tx-filter-chip ${activeFilter === 'REWORK' ? 'active' : ''}`}
          onClick={() => setActiveFilter('REWORK')}
        >
          Corrections Needed ({tasks.filter((t: any) => t.status === 'REWORK_REQUIRED').length})
        </button>
        <button
          type="button"
          className={`tx-filter-chip ${activeFilter === 'REVIEW' ? 'active' : ''}`}
          onClick={() => setActiveFilter('REVIEW')}
        >
          Under Review ({tasks.filter((t: any) => t.status === 'PENDING_REVIEW').length})
        </button>
        <button
          type="button"
          className={`tx-filter-chip ${activeFilter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setActiveFilter('COMPLETED')}
        >
          Completed ({tasks.filter((t: any) => t.status === 'COMPLETED').length})
        </button>
      </div>

      <TaskQueueTable tasks={filteredTasks} loading={loading} />
    </div>
  );
}
