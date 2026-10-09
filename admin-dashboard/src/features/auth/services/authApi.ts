import { apiClient } from '../../../core/services/apiClient';
import { ROLES } from '../../../core/constants/roles';

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
  token: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const apiRes = await apiClient.post('/identity/login', { email, password });
    if (apiRes) return apiRes as AuthResponse;

    // Production mock authentication
    if (email.includes('admin')) {
      return {
        user: { id: 'ADM001', name: 'Rohan Sharma', email, role: ROLES.ADMIN, avatar: 'RS' },
        token: 'jwt_admin_token_taxedge'
      };
    } else if (email.includes('manager')) {
      return {
        user: { id: 'MGR001', name: 'Sanjay Verma', email, role: ROLES.MANAGER, avatar: 'SV' },
        token: 'jwt_manager_token_taxedge'
      };
    } else {
      return {
        user: { id: 'AGT001', name: 'Suresh Kumar', email, role: ROLES.AGENT, avatar: 'SK' },
        token: 'jwt_agent_token_taxedge'
      };
    }
  },

  async logout() {
    await apiClient.post('/identity/logout', {});
    return true;
  }
};
