import React, { useState, FormEvent } from 'react';
import Button from '../../../core/components/Button/Button';
import './LoginForm.css';

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  error?: string | null;
}

export default function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('admin@taxedge.in');
  const [password, setPassword] = useState('Taxedge@2026');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email, password);
    }
  };

  const handleDemoSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Taxedge@2026');
  };

  return (
    <form className="tx-login-form" onSubmit={handleSubmit}>
      {error && <div className="tx-form-error">{error}</div>}

      <div className="tx-form-group">
        <label className="tx-form-label" htmlFor="tx-email">
          Email Address
        </label>
        <input
          id="tx-email"
          type="email"
          className="tx-form-input"
          placeholder="name@taxedge.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="tx-form-group">
        <label className="tx-form-label" htmlFor="tx-password">
          Password
        </label>
        <input
          id="tx-password"
          type="password"
          className="tx-form-input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" variant="orange" size="lg" loading={loading}>
        Sign In to TaxEdge Admin
      </Button>

      <div className="tx-demo-accounts">
        <div className="tx-demo-accounts-title">Quick Demo Login:</div>
        <div className="tx-demo-btns">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDemoSelect('admin@taxedge.in')}
          >
            Admin Account
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDemoSelect('manager@taxedge.in')}
          >
            Manager Account
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDemoSelect('agent@taxedge.in')}
          >
            Agent Account
          </Button>
        </div>
      </div>
    </form>
  );
}
