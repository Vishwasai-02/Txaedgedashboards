# TaxEdge Advanced Modular Monolith Architecture Blueprint

## Architectural Overview
TaxEdge is designed as an **Advanced Modular Monolith**, separating domain features, core infrastructure, shared state management, and presentational UI components into decoupled, strictly bounded modules.

```
                  ┌──────────────────────────────────────────┐
                  │             Presentation Layer            │
                  │   (Admin Dashboard & Staff Dashboard)    │
                  └────────────────────┬─────────────────────┘
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │              Feature Modules             │
                  │ (CA Manager, Loan Manager, Auth, Agent)  │
                  └────────────────────┬─────────────────────┘
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │             Application Layer            │
                  │ (workflowSlice, applicationSlice, Store) │
                  └────────────────────┬─────────────────────┘
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │           Infrastructure Layer           │
                  │ (apiClient, localStorage, Event Emitter) │
                  └──────────────────────────────────────────┘
```

---

## Modular Boundaries & Layer Responsibilities

### 1. Presentation Layer (`features/*/pages`, `features/*/components`)
- Pure UI components enforcing HSL design system tokens, CSS glassmorphism, responsive grids, and Lucide icons.
- Responsible for state rendering and user action dispatching.
- No direct persistence or raw storage access.

### 2. Feature Modules Layer (`features/*`)
- Encapsulates domain logic for specific business domains (`ca-manager`, `loan-manager`, `communication`, `agent`, `auth`).
- Communicates via dedicated API wrappers (`caManagerApi`, `loanManagerApi`, `agentApi`, `staffCommunicationApi`).

### 3. Application State Layer (`core/store`, `shared/store`)
- Centralized reactive state store built on an Observable event-bus subscriber model (`sharedWorkflowStore`).
- Maintains normalized domain slices (`workflowSlice`, `applicationSlice`).
- Enforces state immutability via defensive cloning and functional immutability primitives.

### 4. Infrastructure & Persistence Layer (`core/services`, `infrastructure/persistence`)
- API abstraction (`apiClient`) with interceptor support.
- LocalStorage fallback hydration for local demo resilience.
- Event pub-sub system for cross-component subscription without polling overhead.

---

## Domain & Hierarchy Isolation Guard Clauses

### 1. Bilateral Communication Isolation
- Direct messages between users are scoped strictly to bilateral threads (`(userA, userB)`).
- Cross-domain channels (e.g. CA Manager to Loan Agent) trigger immediate access denied errors via `validateThreadAccess` guard clauses.

### 2. Manager Team Boundary Enforcement
- CA Manager team APIs filter agents where `domain === 'CA'`.
- Loan Manager team APIs filter agents where `domain === 'LOAN'`.
- Operations added by one manager are isolated from opposing domain dashboards.

### 3. Service Queue & Pipeline Filtering
- CA Filing Queue only displays statutory tax compliance services (GST, ITR, Audit, ROC).
- Loan Service Queue only displays credit origination tasks (Underwriting, CIBIL Appraisal, Sanction, Disbursement).

---

## File Granularity & Modularity Standard
- **Max File Length**: Strictly <= 499 lines per file.
- **Decomposition Strategy**: Oversized pages are refactored into sub-components, modal dialogs, custom hooks, or specialized utility files.
- **TypeScript Strictness**: Zero `any` suppressions in application interfaces, mandatory return types on API boundaries, explicit React FormEvent/ChangeEvent typing.
