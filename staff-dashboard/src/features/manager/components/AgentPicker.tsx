import React, { useState } from 'react';
import Button from '../../../core/components/Button/Button';
import { PRIORITY } from '../../../core/constants/statusEnums';
import './AgentPicker.css';

export interface AgentPickerProps {
  agents?: any[];
  currentAgent?: string;
  onAssign: (data: { agentName: string; priority: string; deadline: string; instructions: string }) => void;
  onCancel: () => void;
}

export default function AgentPicker({ agents = [], currentAgent, onAssign, onCancel }: AgentPickerProps) {
  const [selectedAgent, setSelectedAgent] = useState(currentAgent || agents[0]?.name || 'Suresh Kumar');
  const [priority, setPriority] = useState(PRIORITY.HIGH);
  const [deadline, setDeadline] = useState('2026-09-24');
  const [instructions, setInstructions] = useState('Verify original electricity bill date and ensure ARN is filed within 24 hours.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign({
      agentName: selectedAgent,
      priority,
      deadline,
      instructions
    });
  };

  return (
    <form className="tx-agent-picker" onSubmit={handleSubmit}>
      <div className="tx-picker-field">
        <label className="tx-picker-label">Assign Operational Executive / Agent</label>
        <select
          className="tx-picker-select"
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
        >
          {agents.map((ag) => (
            <option key={ag.id} value={ag.name}>
              {ag.name} ({ag.activeCases} active cases — Rating {ag.rating}★)
            </option>
          ))}
        </select>
      </div>

      <div className="tx-picker-row">
        <div className="tx-picker-field">
          <label className="tx-picker-label">Filing Priority</label>
          <select
            className="tx-picker-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value={PRIORITY.HIGH}>HIGH (Within 24 Hours)</option>
            <option value={PRIORITY.MEDIUM}>MEDIUM (Within 48 Hours)</option>
            <option value={PRIORITY.LOW}>LOW (Routine Queue)</option>
          </select>
        </div>

        <div className="tx-picker-field">
          <label className="tx-picker-label">Target Completion Deadline</label>
          <input
            type="date"
            className="tx-picker-input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="tx-picker-field">
        <label className="tx-picker-label">Instructions / Review Notes to Executive</label>
        <textarea
          className="tx-picker-textarea"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Special filing requirements, customer preferences..."
        />
      </div>

      <div className="tx-picker-footer">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="orange">
          Confirm Assignment
        </Button>
      </div>
    </form>
  );
}
