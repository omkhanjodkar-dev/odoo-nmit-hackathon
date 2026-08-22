import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger', 'success', 'ghost'
  size = 'md',          // 'sm', 'md', 'lg'
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    loading ? 'btn-loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {!loading && icon && iconPosition === 'left' && <span className="btn-icon left">{icon}</span>}
      <span className="btn-content">{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="btn-icon right">{icon}</span>}
    </button>
  );
};

export default Button;
