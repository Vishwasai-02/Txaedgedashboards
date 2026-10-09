// Mock localStorage for Node environment
const memStore = new Map();
globalThis.localStorage = {
  getItem: (k) => memStore.has(k) ? memStore.get(k) : null,
  setItem: (k, v) => memStore.set(k, String(v)),
  removeItem: (k) => memStore.delete(k),
  clear: () => memStore.clear(),
};

const { sharedWorkflowStore } = await import('./staff-dashboard/src/core/store/sharedWorkflowStore.js');
const { caManagerApi } = await import('./staff-dashboard/src/features/ca-manager/services/caManagerApi.js');
const { loanManagerApi } = await import('./staff-dashboard/src/features/loan-manager/services/loanManagerApi.js');

// Initialize storage with fresh mock data
sharedWorkflowStore.initStorage(true);

console.log('=== RUNNING CA & LOAN MANAGER ENHANCEMENT VERIFICATION ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  // Test 1: CA Manager Team Isolation
  console.log('--- Test 1: CA Manager Team Isolation ---');
  const caTeam = await caManagerApi.getTeam();
  assert(caTeam.length >= 2, `CA Manager has ${caTeam.length} agents`);
  assert(caTeam.every(a => !a.domain || a.domain === 'CA' || a.id.startsWith('AGT001') || a.id.startsWith('AGT002')), 'CA Manager sees only CA domain agents');

  // Test 2: Loan Manager Team Isolation
  console.log('\n--- Test 2: Loan Manager Team Isolation ---');
  const loanTeam = await loanManagerApi.getTeam();
  assert(loanTeam.length >= 2, `Loan Manager has ${loanTeam.length} agents`);
  assert(loanTeam.every(a => a.id === 'AGT003' || a.id === 'AGT004' || a.domain === 'LOAN'), 'Loan Manager sees only Loan domain agents');

  // Test 3: Add New CA Agent
  console.log('\n--- Test 3: CA Manager Adds New Agent ---');
  const newCaAgent = await caManagerApi.addAgent({
    name: 'Ramesh Iyer',
    email: 'ramesh.i@taxedge.in',
    phone: '+91 98200 88990',
    role: 'GST Filing Specialist',
    activeCases: 3
  });
  assert(newCaAgent && newCaAgent.id, `Created CA agent with ID ${newCaAgent.id}`);
  const updatedCaTeam = await caManagerApi.getTeam();
  assert(updatedCaTeam.some(a => a.id === newCaAgent.id && a.name === 'Ramesh Iyer'), 'New CA agent appears immediately in CA team list');
  const loanTeamCheck = await loanManagerApi.getTeam();
  assert(!loanTeamCheck.some(a => a.id === newCaAgent.id), 'New CA agent is strictly hidden from Loan Manager team list');

  // Test 4: Remove CA Agent
  console.log('\n--- Test 4: CA Manager Removes Agent ---');
  await caManagerApi.removeAgent(newCaAgent.id);
  const caTeamAfterRemove = await caManagerApi.getTeam();
  assert(!caTeamAfterRemove.some(a => a.id === newCaAgent.id), 'Removed CA agent no longer appears in CA team list');

  // Test 5: Add New Loan Agent
  console.log('\n--- Test 5: Loan Manager Adds New Agent ---');
  const newLoanAgent = await loanManagerApi.addAgent({
    name: 'Vikram Joshi',
    email: 'vikram.j@taxedge.in',
    phone: '+91 98200 44556',
    role: 'Underwriting & Appraisal Executive',
    activeCases: 2
  });
  assert(newLoanAgent && newLoanAgent.id, `Created Loan agent with ID ${newLoanAgent.id}`);
  const updatedLoanTeam = await loanManagerApi.getTeam();
  assert(updatedLoanTeam.some(a => a.id === newLoanAgent.id && a.name === 'Vikram Joshi'), 'New Loan agent appears immediately in Loan team list');
  const caTeamCheck = await caManagerApi.getTeam();
  assert(!caTeamCheck.some(a => a.id === newLoanAgent.id), 'New Loan agent is strictly hidden from CA Manager team list');

  // Test 6: Remove Loan Agent
  console.log('\n--- Test 6: Loan Manager Removes Agent ---');
  await loanManagerApi.removeAgent(newLoanAgent.id);
  const loanTeamAfterRemove = await loanManagerApi.getTeam();
  assert(!loanTeamAfterRemove.some(a => a.id === newLoanAgent.id), 'Removed Loan agent no longer appears in Loan team list');

  // Test 7: Customer Details Availability in CA Manager
  console.log('\n--- Test 7: Customer Details Availability in CA Manager ---');
  const caCustomers = await caManagerApi.getCustomers();
  assert(caCustomers.length > 0, `CA Manager has ${caCustomers.length} customer records`);
  assert(caCustomers.every(c => c.gstin && c.pan && c.name), 'CA customer records contain required detail fields (GSTIN, PAN, Name)');

  // Test 8: Customer Details Availability in Loan Manager
  console.log('\n--- Test 8: Customer Details Availability in Loan Manager ---');
  const loanCustomers = await loanManagerApi.getCustomers();
  assert(loanCustomers.length > 0, `Loan Manager has ${loanCustomers.length} borrower customer records`);
  assert(loanCustomers.every(c => c.pan && c.name), 'Loan customer records contain required detail fields (PAN, Borrower Name, Contact)');

  // Test 9: One-to-One Communication inside CA Agent Details
  console.log('\n--- Test 9: One-to-One Communication inside CA Agent Details ---');
  const sentCaMsg = sharedWorkflowStore.sendDirectMessage({
    senderId: 'MGR001',
    senderName: 'Sanjay Verma',
    senderRole: 'CA_MANAGER',
    recipientId: 'AGT001',
    recipientName: 'Suresh Kumar',
    recipientRole: 'CA_AGENT',
    text: 'Priority verification on Apex Logistics GSTR-3B.'
  });
  assert(sentCaMsg && sentCaMsg.id, 'Message sent from CA Manager to CA Agent');
  const caAgentMsgs = sharedWorkflowStore.getDirectMessages('MGR001', 'AGT001');
  assert(caAgentMsgs.some(m => m.text === 'Priority verification on Apex Logistics GSTR-3B.'), 'Message visible in 1-to-1 thread');

  // Test 10: One-to-One Communication inside Loan Agent Details
  console.log('\n--- Test 10: One-to-One Communication inside Loan Agent Details ---');
  const sentLoanMsg = sharedWorkflowStore.sendDirectMessage({
    senderId: 'MGR002',
    senderName: 'Ananya Deshmukh',
    senderRole: 'LOAN_MANAGER',
    recipientId: 'AGT003',
    recipientName: 'Rajesh Patel',
    recipientRole: 'LOAN_AGENT',
    text: 'Review the updated CIBIL audit report for Kumar Sanu.'
  });
  assert(sentLoanMsg && sentLoanMsg.id, 'Message sent from Loan Manager to Loan Agent');
  const loanAgentMsgs = sharedWorkflowStore.getDirectMessages('MGR002', 'AGT003');
  assert(loanAgentMsgs.some(m => m.text === 'Review the updated CIBIL audit report for Kumar Sanu.'), 'Message visible in 1-to-1 thread');

  // Test 11: Cross-Role Isolation (Loan Manager cannot see CA Agent messages)
  console.log('\n--- Test 11: Strict Cross-Role Isolation ---');
  const crossMsgs = sharedWorkflowStore.getDirectMessages('MGR002', 'AGT001');
  assert(crossMsgs.length === 0, 'Loan Manager cannot see or access CA Agent communication');

  // Test 12: Loan Manager Service Queue Retrieval & Isolation
  console.log('\n--- Test 12: Loan Manager Service Queue Retrieval & Isolation ---');
  const loanQueue = await loanManagerApi.getServiceQueue();
  assert(loanQueue.length >= 4, `Loan Manager has ${loanQueue.length} items in service queue`);
  assert(loanQueue.every(item => !item.serviceCode.startsWith('TX-')), 'Loan Manager Service Queue contains zero CA tax services');
  assert(loanQueue.some(item => item.id === 'SQ-LN-201' && item.client === 'Apex Infra Projects LLP'), 'Loan service queue contains loan term loan appraisal');

  // Test 13: Loan Manager Service Queue Delegation & Status Advance
  console.log('\n--- Test 13: Loan Manager Service Queue Delegation & Status Advance ---');
  await loanManagerApi.assignAgent('SQ-LN-201', 'Kavita Iyer', { priority: 'URGENT' });
  const updatedLoanQueue = await loanManagerApi.getServiceQueue();
  const delegatedCase = updatedLoanQueue.find(item => item.id === 'SQ-LN-201');
  assert(delegatedCase.assignedAgent === 'Kavita Iyer', 'Delegated case assigned to Kavita Iyer');
  assert(delegatedCase.priority === 'URGENT', 'Priority elevated to URGENT');
  await loanManagerApi.updateServiceStatus('SQ-LN-201', 'PENDING_REVIEW');
  const statusUpdatedQueue = await loanManagerApi.getServiceQueue();
  assert(statusUpdatedQueue.find(item => item.id === 'SQ-LN-201').status === 'PENDING_REVIEW', 'Status updated to PENDING_REVIEW');

  // Test 14: Loan Manager Follow Ups
  console.log('\n--- Test 14: Loan Manager Follow Ups ---');
  const loanFollowups = await loanManagerApi.getFollowups();
  assert(loanFollowups.length >= 4, `Loan Manager has ${loanFollowups.length} follow-up records`);
  assert(loanFollowups.every(f => f.facility), 'All loan follow-ups have dedicated facility references');
  assert(loanFollowups.some(f => f.client === 'Apex Infra Projects LLP' && f.reason.includes('consortium')), 'Contains borrower consortium follow-up');

  // Test 15: CA Manager vs Loan Manager Queue Isolation
  console.log('\n--- Test 15: CA vs Loan Queue Isolation ---');
  const caQueue = await caManagerApi.getServiceQueue();
  assert(caQueue.every(item => !item.id.startsWith('SQ-LN-')), 'CA Manager Service Queue contains zero Loan domain tasks');

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
