import React from 'react';
import { Camera, Edit2, Save, X, Building2, MapPin, User, Flame } from 'lucide-react';

export default function ProfileHeader({
  employee,
  isEditing,
  onToggleEdit,
  onSave,
  onChangeField,
  canEditJobDetails,
}) {
  const handleAvatarChange = () => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const newAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80&sig=${randomSeed}`;
    onChangeField('avatar', newAvatar);
  };

  const isPresent = employee.status === 'present' || employee.attendance_status === 'PRESENT';
  const isOnLeave = employee.status === 'on_leave' || employee.attendance_status === 'LEAVE';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left: Avatar & Identity */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative group">
            <img
              src={employee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={employee.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-slate-100 shadow-md"
            />
            {isEditing && (
              <button
                type="button"
                onClick={handleAvatarChange}
                className="absolute inset-0 bg-slate-900/60 rounded-3xl flex flex-col items-center justify-center text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span>Change Photo</span>
              </button>
            )}
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${
                isPresent ? 'bg-emerald-500' : isOnLeave ? 'bg-sky-500' : 'bg-amber-500'
              }`}
            />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              {isEditing && canEditJobDetails ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={employee.firstName || ''}
                    onChange={(e) => {
                      const newFirst = e.target.value;
                      onChangeField('firstName', newFirst);
                      onChangeField('name', `${newFirst} ${employee.lastName || ''}`);
                    }}
                    placeholder="First Name"
                    className="px-2.5 py-1 text-lg font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={employee.lastName || ''}
                    onChange={(e) => {
                      const newLast = e.target.value;
                      onChangeField('lastName', newLast);
                      onChangeField('name', `${employee.firstName || ''} ${newLast}`);
                    }}
                    placeholder="Last Name"
                    className="px-2.5 py-1 text-lg font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {employee.name}
                </h1>
              )}

              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {employee.employeeId}
              </span>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isPresent
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isOnLeave
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isPresent ? '🟢 Present in Office' : isOnLeave ? '✈️ On Leave' : '🟡 Absent'}
              </span>

              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Activity Matrix</span>
              </span>
            </div>

            {/* Designation & Dept */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
              {isEditing && canEditJobDetails ? (
                <input
                  type="text"
                  value={employee.designation || ''}
                  onChange={(e) => onChangeField('designation', e.target.value)}
                  placeholder="Designation"
                  className="px-2 py-0.5 text-xs font-semibold border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <span className="font-bold text-indigo-600">{employee.designation}</span>
              )}
              <span className="text-slate-300">•</span>
              {isEditing && canEditJobDetails ? (
                <input
                  type="text"
                  value={employee.department || ''}
                  onChange={(e) => onChangeField('department', e.target.value)}
                  placeholder="Department"
                  className="px-2 py-0.5 text-xs font-semibold border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <span className="text-slate-500 font-medium">{employee.department}</span>
              )}
            </div>

            {/* Meta tags */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{employee.company || 'Odoo India'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{employee.location || 'Gandhinagar, Gujarat'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Manager: <strong className="text-slate-700">{employee.manager || 'Alex Morgan'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onToggleEdit}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={onSave}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onToggleEdit}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
