import { ROLES, DOMAINS, PERMISSIONS } from '../constants/roles';

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
    const storedUser = localStorage.getItem('taxedge_user');
    this.user = storedUser ? JSON.parse(storedUser) : {
      id: 'ADM001',
      name: 'Rohan Sharma',
      email: 'admin@taxedge.in',
      role: ROLES.SUPER_ADMIN,
      domain: DOMAINS.GLOBAL,
      avatar: 'RS',
      permissions: [
        PERMISSIONS.CAN_COMMUNICATE_MANAGER,
        PERMISSIONS.CAN_MONITOR_AGENTS
      ]
    };
    this.token = localStorage.getItem('taxedge_token') || 'demo_jwt_token_taxedge';
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
    localStorage.setItem('taxedge_user', JSON.stringify(user));
    localStorage.setItem('taxedge_token', token);
    this.notify();
  }

  logout(): void {
    this.user = null;
    this.token = null;
    localStorage.removeItem('taxedge_user');
    localStorage.removeItem('taxedge_token');
    this.notify();
  }

  setRole(role: string): void {
    if (this.user) {
      this.user = { ...this.user, role };
      localStorage.setItem('taxedge_user', JSON.stringify(this.user));
      this.notify();
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
