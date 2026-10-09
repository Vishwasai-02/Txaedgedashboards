import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VerificationPanel from '../components/VerificationPanel';
import DocumentChecklist from '../components/DocumentChecklist';
import AgentPicker from '../components/AgentPicker';
import Modal from '../../../core/components/Modal/Modal';
import Button from '../../../core/components/Button/Button';
import { managerApi } from '../services/managerApi';
import { ApplicationItem } from '../../../shared/types/workflowTypes';
import './ApplicationVerificationPage.css';

export default function ApplicationVerificationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const appId = id || 'APP001';

  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      managerApi.getApplication(appId),
      managerApi.getTeamMonitoring()
    ]).then(([app, teamList]: [any, any]) => {
      setApplication(app);
      setAgents(teamList);
      setLoading(false);
    });
  }, [appId]);

  const handleDocumentStatusChange = async (docId: string, newStatus: string) => {
    await managerApi.updateDocumentStatus(appId, docId, newStatus);
    const updated = await managerApi.getApplication(appId);
    setApplication(updated);
    setToast(`Document status updated to ${newStatus}.`);
    setTimeout(() => setToast(''), 3500);
  };

  const handleUpdatePricing = async (pricingData: any) => {
    await managerApi.updatePricing(appId, pricingData);
    const updated = await managerApi.getApplication(appId);
    setApplication(updated);
    setToast('Pricing schedule saved.');
    setTimeout(() => setToast(''), 3500);
  };

  const handleAssignAgent = async (assignmentData: any) => {
    await managerApi.assignAgent(
      appId,
      assignmentData.agentName,
      assignmentData.priority,
      assignmentData.deadline,
      assignmentData.instructions
    );
    setIsAssignModalOpen(false);
    const updated = await managerApi.getApplication(appId);
    setApplication(updated);
    setToast(`Application ${appId} assigned to ${assignmentData.agentName}`);
    setTimeout(() => setToast(''), 4500);
  };

  if (loading || !application) {
    return <div>Loading application verification details...</div>;
  }

  return (
    <div className="tx-verif-page">
      {toast && (
        <div className="tx-verif-toast">
          <span>✓ {toast}</span>
        </div>
      )}
      <div className="tx-verif-page-header">
        <div className="tx-verif-page-title">
          <h2>Application Case Verification: {application.id}</h2>
          <p>
            Audit uploaded customer documents, adjust service pricing schedule, and assign to executive
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/manager/incoming-queue')}>
          Back to Queue
        </Button>
      </div>

      <VerificationPanel
        application={application}
        onUpdatePricing={handleUpdatePricing}
        onOpenAssignModal={() => setIsAssignModalOpen(true)}
      />

      <div className="tx-verif-checklist-section">
        <h3 className="tx-checklist-heading">Uploaded Supporting Documents</h3>
        <DocumentChecklist
          documents={application.documents || []}
          onStatusChange={handleDocumentStatusChange}
        />
      </div>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Executive for Case ${application.id}`}
      >
        <AgentPicker
          agents={agents}
          currentAgent={application.assignedExecutive}
          onAssign={handleAssignAgent}
          onCancel={() => setIsAssignModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
