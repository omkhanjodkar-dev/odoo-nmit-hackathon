import React, { useState, useEffect } from 'react';
import { X, Calendar, Upload, FileText, AlertCircle, CheckCircle2, Paperclip } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../../data/storage';

export default function LeaveRequestModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const [currentUser] = useState(() => storage.getCurrentUser());
  const [employees] = useState(() => storage.getEmployees());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(currentUser?.id || 'emp-1');
  const [leaveType, setLeaveType] = useState('Paid Time Off');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN_HR';

  // Set default dates on open
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
      setTotalDays(1);
      setLeaveType('Paid Time Off');
      setReason('');
      setAttachment(null);
      setError('');
      setSelectedEmployeeId(currentUser?.id || 'emp-1');
    }
  }, [isOpen, currentUser]);

  // Automatic Days Calculation
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diffDays);
        setError('');
      } else {
        setTotalDays(0);
        setError('End date cannot be earlier than start date.');
      }
    }
  }, [startDate, endDate]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment({
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        fileType: file.type || 'document',
      });
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Please select both start date and end date.');
      return;
    }
    if (totalDays <= 0) {
      setError('Invalid date range.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the leave application.');
      return;
    }

    // Check balances
    const targetEmp = employees.find((emp) => emp.id === selectedEmployeeId) || currentUser;
    const balances = storage.getLeaveBalances();
    const empBalance = balances[targetEmp.id];

    if (leaveType === 'Paid Time Off' && empBalance?.paidLeave?.available < totalDays) {
      setError(`Insufficient Paid Leave balance. You have ${empBalance?.paidLeave?.available || 0} days available.`);
      return;
    }

    if (leaveType === 'Sick Time Off' && empBalance?.sickLeave?.available < totalDays) {
      setError(`Insufficient Sick Leave balance. You have ${empBalance?.sickLeave?.available || 0} days available.`);
      return;
    }

    // Create Leave Request Object
    const newRequest = {
      id: `leave-req-${Date.now()}`,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      employeeAvatar: targetEmp.avatar,
      department: targetEmp.department,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      attachment,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedByName: null,
      reviewedAt: null,
      adminRemarks: null,
    };

    storage.update(STORAGE_KEYS.LEAVE_REQUESTS, (records = []) => [newRequest, ...records]);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header matching Wireframe "Time off Type Request" */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-none">Time off Type Request</h3>
              <p className="text-xs text-gray-500 mt-1">Submit application for manager review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Field (Wireframe line 16188: Employee) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Employee
            </label>
            {isAdmin ? (
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                value={`${currentUser?.name} (${currentUser?.employeeId} - ${currentUser?.department})`}
                className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium cursor-not-allowed"
              />
            )}
          </div>

          {/* Time Off Type (Wireframe line 16225: Time off Type) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Time off Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              required
            >
              <option value="Paid Time Off">Paid Time Off (Annual Vacation)</option>
              <option value="Sick Time Off">Sick Time Off (Medical Rest)</option>
              <option value="Unpaid Leave">Unpaid Leave (Loss of Pay)</option>
            </select>
          </div>

          {/* Validity Period / Dates (Wireframe lines 16262-16298: Validity Period ... To) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Validity Period <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 items-center gap-3">
              <div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-700">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  required
                />
              </div>
            </div>
            {totalDays > 0 && (
              <p className="text-xs font-semibold text-purple-700 mt-1.5">
                Total Duration: <span className="underline">{totalDays} {totalDays === 1 ? 'Working Day' : 'Working Days'}</span>
              </p>
            )}
          </div>

          {/* Reason / Remarks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Reason / Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason for taking time off..."
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Attachment Upload (Wireframe lines 18928-19008: Attachment: For sick leave certificate) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Attachment: <span className="text-xs font-normal text-gray-500">(Optional / Medical certificate)</span>
            </label>

            {attachment ? (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{attachment.fileName}</p>
                    <p className="text-[10px] text-gray-500">{attachment.fileSize}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-purple-50/20 transition-all">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs font-semibold text-gray-700">Click to upload supporting file</span>
                <span className="text-[10px] text-gray-400 mt-0.5">PDF, PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Submit Time Off Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
