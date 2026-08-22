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

        <form onSubmit={handleVerify} className="mt-6">
          <div className="flex justify-center gap-2 sm:gap-2.5">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`digit-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 text-center text-lg font-extrabold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40 focus:border-[#714B67] transition-all"
                placeholder="•"
              />
            ))}
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 text-center mt-3 animate-fadeIn">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 px-4 rounded-xl bg-[#714B67] hover:bg-[#5a3b52] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#714B67]/50"
            >
              {isVerifying ? (
                <span>Verifying security token...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Proceed to Workspace</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setCode(['1', '2', '3', '4', '5', '6']);
                setError('');
              }}
              className="text-xs font-semibold text-[#714B67] hover:underline text-center"
            >
              Auto-fill Demo Code (123456)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
