import React, { useState } from 'react';
import { Mail, CheckCircle2, X } from 'lucide-react';

export default function EmailVerificationModal({ isOpen, email, onClose, onVerified }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const enteredCode = code.join('');
    if (enteredCode.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      setIsVerifying(false);
      onVerified();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#714B67] flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Mail className="w-7 h-7" />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Verify Your Email</h3>
          <p className="text-sm text-slate-500 mt-1">
            We sent a 6-digit security verification code to:
          </p>
          <p className="text-sm font-bold text-[#714B67] mt-0.5">{email || 'your-email@odooindia.com'}</p>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm font-medium text-slate-600 mb-6">
            Please click the secure link we sent to your inbox to verify your account and activate your workspace.
          </p>

          <button
            type="button"
            onClick={onVerified}
            className="w-full py-2.5 px-4 rounded-xl bg-[#714B67] hover:bg-[#5a3b52] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#714B67]/50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I have verified my email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
