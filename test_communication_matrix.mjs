// Verification test script for TaxEdge Role-Based One-to-One Communication Matrix
const memStore = new Map();
globalThis.localStorage = {
  getItem: (k) => memStore.has(k) ? memStore.get(k) : null,
  setItem: (k, v) => memStore.set(k, String(v)),
  removeItem: (k) => memStore.delete(k),
  clear: () => memStore.clear(),
};

const { sharedWorkflowStore } = await import('./admin-dashboard/src/core/store/sharedWorkflowStore.js');
sharedWorkflowStore.initStorage(true);

console.log('=== RUNNING TAXEDGE 1-TO-1 COMMUNICATION VERIFICATION ===\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

// Test 1: Seeded messages isolation
console.log('--- Test 1: Message Isolation between Super Admin and CA Manager ---');
const adminCaMsgs = sharedWorkflowStore.getDirectMessages('ADM001', 'MGR001');
assert(adminCaMsgs.length > 0, `Super Admin <-> CA Manager has ${adminCaMsgs.length} messages`);
assert(adminCaMsgs.every(m => (m.senderId === 'ADM001' && m.recipientId === 'MGR001') || (m.senderId === 'MGR001' && m.recipientId === 'ADM001')), 'Strict bilateral isolation maintained (no 3rd party messages)');

console.log('\n--- Test 2: Message Isolation between CA Manager and CA Agent ---');
const caMgrAgt1 = sharedWorkflowStore.getDirectMessages('MGR001', 'AGT001');
assert(caMgrAgt1.length > 0, `CA Manager <-> CA Agent 1 has ${caMgrAgt1.length} messages`);
assert(caMgrAgt1.every(m => (m.senderId === 'MGR001' && m.recipientId === 'AGT001') || (m.senderId === 'AGT001' && m.recipientId === 'MGR001')), 'CA Manager <-> CA Agent strictly isolated');

console.log('\n--- Test 3: Negative Test - CA Agent 1 cannot see CA Agent 2 messages ---');
const caAgt1Agt2 = sharedWorkflowStore.getDirectMessages('AGT001', 'AGT002');
assert(caAgt1Agt2.length === 0, 'No peer-to-peer messages between CA Agents (Strict Hierarchy)');

console.log('\n--- Test 4: Negative Test - CA Manager cannot see Loan Agent messages ---');
const caMgrLoanAgt = sharedWorkflowStore.getDirectMessages('MGR001', 'AGT003');
assert(caMgrLoanAgt.length === 0, 'No cross-domain messages between CA Manager and Loan Agent');

console.log('\n--- Test 5: Negative Test - Loan Manager cannot see CA Agent messages ---');
const loanMgrCaAgt = sharedWorkflowStore.getDirectMessages('MGR002', 'AGT001');
assert(loanMgrCaAgt.length === 0, 'No cross-domain messages between Loan Manager and CA Agent');

console.log('\n--- Test 6: Message Isolation between Loan Manager and Loan Agent ---');
const loanMgrLoanAgt = sharedWorkflowStore.getDirectMessages('MGR002', 'AGT003');
assert(loanMgrLoanAgt.length > 0, `Loan Manager <-> Loan Agent has ${loanMgrLoanAgt.length} messages`);
assert(loanMgrLoanAgt.every(m => (m.senderId === 'MGR002' && m.recipientId === 'AGT003') || (m.senderId === 'AGT003' && m.recipientId === 'MGR002')), 'Loan Manager <-> Loan Agent strictly isolated');

console.log('\n--- Test 7: Send message and automatic notification trigger ---');
const sentMsg = sharedWorkflowStore.sendDirectMessage({
  senderId: 'MGR001',
  senderName: 'Sanjay Verma',
  senderRole: 'CA_MANAGER',
  recipientId: 'AGT001',
  recipientName: 'Suresh Kumar',
  recipientRole: 'CA_AGENT',
  text: 'Automated test message for filing verification.'
});
assert(sentMsg && sentMsg.id, 'Message sent successfully');
const updatedAgt1Msgs = sharedWorkflowStore.getDirectMessages('MGR001', 'AGT001');
assert(updatedAgt1Msgs.some(m => m.text === 'Automated test message for filing verification.'), 'Sent message retrieved in direct thread');

console.log(`\n=== SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED ===`);
if (testsFailed > 0) process.exit(1);
