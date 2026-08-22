import React, { useState } from 'react';
import { Lock, FileText, Upload, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function SecurityDocumentsTab({ employee, isEditing, onChangeField }) {
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const docs = employee.documents || [];

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!passwords.next || passwords.next.length < 8) {
      setPasswordNotice('New password must be at least 8 characters long.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordNotice('New password and confirm password do not match.');
      return;
    }

    setPasswordNotice('✅ Password updated successfully for security profile.');
    setPasswords({ current: '', next: '', confirm: '' });
    setTimeout(() => setPasswordNotice(''), 4000);
  };

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: `Identity_Verification_${Date.now().toString().slice(-4)}.pdf`,
        size: '1.4 MB',
        type: 'pdf',
        uploadDate: new Date().toISOString().split('T')[0],
      };
      onChangeField('documents', [...docs, newDoc]);
      setIsUploading(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Change Password & Security */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#714B67]" />
              Account Security & Password
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Update login credentials and authenticate multi-factor access</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            2FA Active
          </span>
        </div>

        {passwordNotice && (
          <div className="p-3 rounded-xl bg-purple-50 text-xs font-semibold text-[#714B67] border border-purple-100">
            {passwordNotice}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Current Password
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              New Password
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
              placeholder="Min. 8 chars"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Confirm New Password
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1.5"
            >
              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPass ? 'Hide passwords' : 'Show passwords'}</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#714B67] hover:bg-[#5a3b52] text-white font-bold text-xs shadow-sm transition-all"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* 2. Employee Documents */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#714B67]" />
              Employment Documents & Verification Files
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Signed employment agreements, ID proofs, and certifications</p>
          </div>

          <button
            type="button"
            onClick={handleSimulateUpload}
            disabled={isUploading}
            className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-[#714B67] hover:bg-purple-100 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading...' : 'Upload Document'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {docs.map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {doc.size || '1.2 MB'} • Uploaded {doc.uploadDate || '2024'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                Verified
              </span>
            </div>
          ))}

          {docs.length === 0 && (
            <div className="sm:col-span-3 py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No documents uploaded yet. Click Upload Document to add identity records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
