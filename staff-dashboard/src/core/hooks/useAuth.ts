import { useState, useEffect } from 'react';
import { authStore } from '../store/authStore';

export function useAuth() {
  const [user, setUser] = useState(authStore.getUser());

  useEffect(() => {
    const unsubscribe = authStore.subscribe((updatedUser: any) => {
      setUser(updatedUser);
    });
    return unsubscribe;
  }, []);

  return {
    user,
    isAuthenticated: authStore.isAuthenticated(),
    login: (userData: any, token: string) => authStore.login(userData, token),
    logout: () => authStore.logout(),
    switchRole: (role: string) => authStore.setRole(role),
    switchPersona: (personaKey: any) => authStore.switchPersona(personaKey as any)
  };
}
