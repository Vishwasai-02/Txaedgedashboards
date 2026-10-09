import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { authApi } from '../services/authApi';
import { useAuth } from '../../../core/hooks/useAuth';
import './LoginPage.css';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(email, password);
      login(res.user, res.token);
      navigate('/overview');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tx-login-page">
      <div className="tx-login-card">
        <div className="tx-login-header">
          <div className="tx-login-brand-icon">T</div>
          <h2 className="tx-login-title">TaxEdge Dashboard</h2>
          <p className="tx-login-subtitle">
            Enterprise Financial &amp; Tax Compliance Management
          </p>
        </div>
        <div className="tx-login-content">
          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
