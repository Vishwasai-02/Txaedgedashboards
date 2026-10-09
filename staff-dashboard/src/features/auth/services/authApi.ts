import { apiClient } from '../../../core/services/apiClient';
import { STAFF_PERSONAS } from '../../../core/store/authStore';

export interface AuthResponse {
  user: any;
  token: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const apiRes = await apiClient.post('/identity/login', { email, password });
    if (apiRes) return apiRes;

    const lower = (email || '').toLowerCase();
    let persona = STAFF_PERSONAS.CA_MANAGER;

    if (lower.includes('loan') && lower.includes('agent')) {
      persona = STAFF_PERSONAS.LOAN_AGENT;
    } else if (lower.includes('loan') || lower.includes('ananya')) {
      persona = STAFF_PERSONAS.LOAN_MANAGER;
    } else if (lower.includes('rajesh')) {
      persona = STAFF_PERSONAS.LOAN_AGENT;
    } else if (lower.includes('agent') || lower.includes('suresh')) {
      persona = STAFF_PERSONAS.CA_AGENT;
    } else {
      persona = STAFF_PERSONAS.CA_MANAGER;
    }

    return {
      user: { ...persona, email },
      token: `jwt_token_${persona.id.toLowerCase()}`
    };
  },

  async logout(): Promise<boolean> {
    await apiClient.post('/identity/logout', {});
    return true;
  }
};
