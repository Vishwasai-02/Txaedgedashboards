import { ROLES, DOMAINS, PERMISSIONS } from '../constants/roles';

export const STAFF_PERSONAS = {
  CA_MANAGER: {
    id: 'MGR001',
    name: 'Sanjay Verma',
    email: 'sanjay.verma@taxedge.in',
    role: ROLES.CA_MANAGER,
    domain: DOMAINS.CA,
    managerId: null as string | null,
    avatar: 'SV',
    permissions: [
      PERMISSIONS.CAN_COMMUNICATE_AGENT,
      PERMISSIONS.CAN_AUDIT_DOCUMENTS
    ]
  },
  LOAN_MANAGER: {
    id: 'MGR002',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@taxedge.in',
    role: ROLES.LOAN_MANAGER,
    domain: DOMAINS.LOAN,
    managerId: null as string | null,
    avatar: 'AD',
    permissions: [
      PERMISSIONS.CAN_COMMUNICATE_AGENT,
      PERMISSIONS.CAN_AUDIT_DOCUMENTS
    ]
  },
  CA_AGENT: {
    id: 'AGT001',
    name: 'Suresh Kumar',
    email: 'suresh.kumar@taxedge.in',
    role: ROLES.CA_AGENT,
    domain: DOMAINS.CA,
    managerId: 'MGR001',
    avatar: 'SK',
    permissions: [
      PERMISSIONS.CAN_COMMUNICATE_MANAGER,
      PERMISSIONS.CAN_EXECUTE_TASKS
    ]
  },
  LOAN_AGENT: {
    id: 'AGT003',
    name: 'Rajesh Patel',
    email: 'rajesh.patel@taxedge.in',
    role: ROLES.LOAN_AGENT,
    domain: DOMAINS.LOAN,
    managerId: 'MGR002',
    avatar: 'RP',
    permissions: [
      PERMISSIONS.CAN_COMMUNICATE_MANAGER,
      PERMISSIONS.CAN_EXECUTE_TASKS
    ]
  }
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  domain?: string;
  avatar?: string;
  permissions?: string[];
  managerId?: string | null;
}

class AuthStore {
  listeners: Set<(user: UserProfile | null) => void>;
  user: UserProfile | null;
  token: string | null;

  constructor() {
    this.listeners = new Set();
    let initialUser: UserProfile = STAFF_PERSONAS.CA_MANAGER;
    try {
      const storedUser = localStorage.getItem('taxedge_staff_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === 'object' && parsed.role) {
          initialUser = parsed;
        }
      }
    } catch (e) {
      console.warn('Recovered from invalid taxedge_staff_user in localStorage:', e);
    }
    this.user = initialUser;
    this.token = localStorage.getItem('taxedge_staff_token') || 'demo_staff_token_taxedge';
  }

  getUser(): UserProfile | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.user && !!this.token;
  }

  login(user: UserProfile, token: string): void {
    this.user = user;
    this.token = token;
    localStorage.setItem('taxedge_staff_user', JSON.stringify(user));
    localStorage.setItem('taxedge_staff_token', token);
    this.notify();
  }

  logout(): void {
    this.user = null;
    this.token = null;
    localStorage.removeItem('taxedge_staff_user');
    localStorage.removeItem('taxedge_staff_token');
    this.notify();
  }

  switchPersona(personaKey: keyof typeof STAFF_PERSONAS): void {
    const persona = STAFF_PERSONAS[personaKey];
    if (persona) {
      this.login(persona, `jwt_token_${persona.id.toLowerCase()}`);
    }
  }

  setRole(role: string): void {
    if (role === ROLES.MANAGER || role === ROLES.CA_MANAGER) {
      this.switchPersona('CA_MANAGER');
    } else if (role === ROLES.LOAN_MANAGER) {
      this.switchPersona('LOAN_MANAGER');
    } else if (role === ROLES.LOAN_AGENT) {
      this.switchPersona('LOAN_AGENT');
    } else {
      this.switchPersona('CA_AGENT');
    }
  }

  subscribe(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(): void {
    this.listeners.forEach((listener) => listener(this.user));
  }
}

export const authStore = new AuthStore();
