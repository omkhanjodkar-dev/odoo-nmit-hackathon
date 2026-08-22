import React from 'react';
import './Input.css';

export const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  readOnly = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`form-control ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className={`input-wrapper ${icon ? `has-icon-${iconPosition}` : ''}`}>
        {icon && iconPosition === 'left' && <span className="input-icon left">{icon}</span>}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={`form-input ${readOnly ? 'input-readonly' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {icon && iconPosition === 'right' && <span className="input-icon right">{icon}</span>}
      </div>
      {error && <span id={`${inputId}-error`} className="form-error-text">{error}</span>}
      {!error && helperText && <span className="form-helper-text">{helperText}</span>}
    </div>
  );
};

export default Input;
