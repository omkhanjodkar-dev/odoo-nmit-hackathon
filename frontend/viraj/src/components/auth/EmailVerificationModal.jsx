import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import './EmailVerificationModal.css';

export const EmailVerificationModal = ({
  isOpen,
  email,
  onVerified,
  onClose,
}) => {
  const { verifyEmail } = useAuth();
  const [code, setCode] = useState('784920'); // prefilled sample verification code for smooth UX
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      verifyEmail(email);
      setLoading(false);
      onVerified();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Your Work Email"
      subtitle={`We have sent a verification code to ${email || 'your email'}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Skip for now
          </Button>
          <Button variant="primary" onClick={handleVerify} loading={loading}>
            Verify & Continue
          </Button>
        </>
      }
    >
      <form className="verification-form" onSubmit={handleVerify}>
        <div className="verification-icon-wrap">
          <span className="verify-icon">✉️</span>
        </div>
        <p className="verification-info">
          Enter the 6-digit one-time security code to verify your corporate account.
        </p>

        {error && <div className="auth-alert error">{error}</div>}

        <Input
          label="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. 784920"
          required
          autoFocus
          className="verification-input"
        />

        <div className="resend-block">
          <span className="resend-text">Didn't receive the code?</span>
          <button
            type="button"
            className="resend-link"
            onClick={() => setCode('123456')}
          >
            Resend Code
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmailVerificationModal;
