import React from 'react';
import { User, Landmark, ShieldCheck, Mail, MapPin, Calendar } from 'lucide-react';

export default function PrivateInfoTab({ employee, isEditing, onChangeField }) {
  const bank = employee.bankDetails || {};
  const statutory = employee.statutory || {};

  const handleBankChange = (field, value) => {
    onChangeField('bankDetails', {
      ...bank,
      [field]: value,
    });
  };

  const handleStatutoryChange = (field, value) => {
    onChangeField('statutory', {
      ...statutory,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Personal Private Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-[#714B67]" />
          Personal Demographics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* DOB */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Date of Birth
            </label>
            {isEditing ? (
              <input
                type="date"
                value={employee.dateOfBirth || '1995-01-01'}
                onChange={(e) => onChangeField('dateOfBirth', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800">{employee.dateOfBirth || '15 June 1994'}</p>
            )}
          </div>

          {/* Personal Email */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Personal Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={employee.personalEmail || ''}
                onChange={(e) => onChangeField('personalEmail', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800">{employee.personalEmail || employee.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Contact Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={employee.phone || ''}
                onChange={(e) => onChangeField('phone', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800">{employee.phone || '+91 98765 43210'}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Gender
            </label>
            {isEditing ? (
              <select
                value={employee.gender || 'Not specified'}
                onChange={(e) => onChangeField('gender', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-xs font-bold text-slate-800">{employee.gender || 'Male'}</p>
            )}
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Marital Status
            </label>
            {isEditing ? (
              <select
                value={employee.maritalStatus || 'Single'}
                onChange={(e) => onChangeField('maritalStatus', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            ) : (
              <p className="text-xs font-bold text-slate-800">{employee.maritalStatus || 'Single'}</p>
            )}
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Date of Joining
            </label>
            <p className="text-xs font-bold text-slate-800">{employee.joiningDate || '01 July 2022'}</p>
          </div>
        </div>

        {/* Residing Address */}
        <div className="pt-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Residing Address
          </label>
          {isEditing ? (
            <textarea
              rows={2}
              value={employee.residingAddress || ''}
              onChange={(e) => onChangeField('residingAddress', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          ) : (
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {employee.residingAddress || 'Flat 402, Greenwoods Heights, Gandhinagar, Gujarat - 382010'}
            </p>
          )}
        </div>
      </div>

      {/* 2. Bank Account Details */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-[#714B67]" />
          Bank Account Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Bank Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={bank.bankName || ''}
                onChange={(e) => handleBankChange('bankName', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800">{bank.bankName || 'HDFC Bank'}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Account Number
            </label>
            {isEditing ? (
              <input
                type="text"
                value={bank.accountNumber || ''}
                onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            ) : (
              <p className="text-xs font-mono font-bold text-slate-800">{bank.accountNumber || '918273645012'}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              IFSC Code
            </label>
            {isEditing ? (
              <input
                type="text"
                value={bank.ifscCode || ''}
                onChange={(e) => handleBankChange('ifscCode', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            ) : (
              <p className="text-xs font-mono font-bold text-slate-800">{bank.ifscCode || 'HDFC0001234'}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Branch Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={bank.branch || ''}
                onChange={(e) => handleBankChange('branch', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800">{bank.branch || 'Infocity Gandhinagar'}</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Statutory Identification */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#714B67]" />
          Statutory Identification & Compliance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Permanent Account Number (PAN)
            </label>
            {isEditing ? (
              <input
                type="text"
                value={statutory.panNo || ''}
                onChange={(e) => handleStatutoryChange('panNo', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            ) : (
              <p className="text-xs font-mono font-bold text-slate-800">{statutory.panNo || 'ABCDE1234F'}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Universal Account Number (UAN / PF)
            </label>
            {isEditing ? (
              <input
                type="text"
                value={statutory.uanNo || ''}
                onChange={(e) => handleStatutoryChange('uanNo', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            ) : (
              <p className="text-xs font-mono font-bold text-slate-800">{statutory.uanNo || '100908070605'}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Internal Employee Code
            </label>
            <p className="text-xs font-mono font-bold text-[#714B67]">{employee.employeeId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
