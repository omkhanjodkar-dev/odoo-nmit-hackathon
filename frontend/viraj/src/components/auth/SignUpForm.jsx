import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../router/RouterContext';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import { Select } from '../common/Select/Select';
import { EmailVerificationModal } from './EmailVerificationModal';
import './SignUpForm.css';

export const SignUpForm = () => {
  const { signup } = useAuth();
  const { navigate } = useRouter();

  const [formData, setFormData] = useState({
    employee_id: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter a valid work email.');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      signup(formData);
      setLoading(false);
      setRegisteredEmail(formData.email);
      setShowVerifyModal(true);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to create account. Please try again.');
    }
  };

  const handleVerificationComplete = () => {
    setShowVerifyModal(false);
    navigate('/employees');
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join your organization workspace</p>
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
          <div className="form-row">
            <Input
              label="Employee ID"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              placeholder="e.g. EMP1005"
              required
            />
            <Select
              label="User Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: 'EMPLOYEE', label: 'Employee' },
                { value: 'ADMIN_HR', label: 'Admin / HR Officer' }
              ]}
              required
            />
          </div>

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Marcus Vance"
            required
          />

          <div className="form-row">
            <Input
              label="Work Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. marcus.vance@dayflow.internal"
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="form-row">
            <Input
              label="Password (min 8 chars)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            SIGN UP
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account ?{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      <EmailVerificationModal
        isOpen={showVerifyModal}
        email={registeredEmail}
        onVerified={handleVerificationComplete}
        onClose={() => setShowVerifyModal(false)}
      />
    </div>
  );
};

export default SignUpForm;
