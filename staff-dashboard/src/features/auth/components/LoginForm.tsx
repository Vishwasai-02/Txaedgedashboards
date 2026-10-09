import React, { useState, FormEvent } from 'react';
import Button from '../../../core/components/Button/Button';
import './LoginForm.css';

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  error?: string | null;
}

export default function LoginForm({ onSubmit, loading = false, error = null }: LoginFormProps) {
  const [email, setEmail] = useState('manager@taxedge.in');
  const [password, setPassword] = useState('Staff@2026');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email, password);
    }
  };

  const handleDemoSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Staff@2026');
  };

  return (
    <form className="tx-login-form" onSubmit={handleSubmit}>
      {error && <div className="tx-form-error">{error}</div>}

      <div className="tx-form-group">
        <label className="tx-form-label" htmlFor="staff-email">
          Staff Work Email
        </label>
        <input
          id="staff-email"
          type="email"
          className="tx-form-input"
          placeholder="staff@taxedge.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="tx-form-group">
        <label className="tx-form-label" htmlFor="staff-password">
          Password
        </label>
        <input
          id="staff-password"
          type="password"
          className="tx-form-input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" variant="orange" size="lg" loading={loading}>
        Sign In to Staff Portal
      </Button>

      <div className="tx-demo-accounts">
        <div className="tx-demo-accounts-title">Quick Demo Login:</div>
        <div className="tx-demo-btns">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDemoSelect('sanjay.verma@taxedge.in')}
          >
            CA Manager (Sanjay Verma)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDemoSelect('ananya.deshmukh@taxedge.in')}
          >
            Loan Manager (Ananya Deshmukh)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDemoSelect('suresh.kumar@taxedge.in')}
          >
            CA Agent (Suresh Kumar)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDemoSelect('rajesh.patel@taxedge.in')}
          >
            Loan Agent (Rajesh Patel)
          </Button>
        </div>
      </div>
    </form>
  );
}
