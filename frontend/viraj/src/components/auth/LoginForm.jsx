import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../router/RouterContext';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import './LoginForm.css';

export const LoginForm = () => {
  const { login } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('alex.morgan@dayflow.internal');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN_HR'); // 'ADMIN_HR' or 'EMPLOYEE'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email or login ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const user = login(email, password, selectedRole);
      setLoading(false);
      // Navigate to employees directory or dashboard
      navigate('/employees');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid email or password.');
    }
  };

  const handleQuickRole = (role) => {
    setSelectedRole(role);
    if (role === 'ADMIN_HR') {
      setEmail('alex.morgan@dayflow.internal');
    } else {
      setEmail('marcus.vance@dayflow.internal');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="auth-brand-name">Dayflow</h1>
          <p className="auth-tagline">Every workday, perfectly aligned.</p>
        </div>

        <div className="auth-header">
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Access your organization workspace</p>
        </div>

        {/* Demo Quick Role Switcher */}
        <div className="demo-role-selector">
          <span className="demo-role-label">Quick Demo Access:</span>
          <div className="demo-role-buttons">
            <button
              type="button"
              className={`demo-btn ${selectedRole === 'ADMIN_HR' ? 'active' : ''}`}
              onClick={() => handleQuickRole('ADMIN_HR')}
            >
              👑 HR Admin
            </button>
            <button
              type="button"
              className={`demo-btn ${selectedRole === 'EMPLOYEE' ? 'active' : ''}`}
              onClick={() => handleQuickRole('EMPLOYEE')}
            >
              👤 Employee
            </button>
          </div>
        </div>

        {error && (
          <div className="auth-alert error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5V8.5M8 11.5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Work Email / Login ID"
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.morgan@dayflow.internal"
            required
            autoComplete="username"
          />

          <div className="password-input-group">
            <Input
              label="Password"
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            SIGN IN
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an Account?{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
