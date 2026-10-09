import React from 'react';
import './Button.css';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: string;
  size?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  icon = null,
  className = '',
  title,
  style
}: ButtonProps) {
  const variantClass = `tx-btn-${variant}`;
  const sizeClass = `tx-btn-${size}`;
  const customClass = className ? ` ${className}` : '';

  return (
    <button
      type={type}
      className={`tx-btn ${variantClass} ${sizeClass}${customClass}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      style={style}
    >
      {loading ? (
        <span className="tx-btn-spinner" aria-hidden="true" />
      ) : icon ? (
        <span className="tx-btn-icon">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
