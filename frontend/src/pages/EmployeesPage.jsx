import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage, STORAGE_KEYS } from '../data/storage';
import EmployeeKanban from '../components/employees/EmployeeKanban';
import EmployeeTable from '../components/employees/EmployeeTable';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import { Users, Search, Plus, LayoutGrid, List, Filter } from 'lucide-react';

export default function EmployeesPage() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState(() => storage.getEmployees());
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const unsub = storage.subscribe(STORAGE_KEYS.EMPLOYEES, (emps) => {
      if (emps) setEmployees(emps);
    });
    return () => unsub();
  }, []);

  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
    return ['ALL', ...depts];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.name?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;

      const isPresent = emp.status === 'present' || emp.attendance_status === 'PRESENT';
      const isOnLeave = emp.status === 'on_leave' || emp.attendance_status === 'LEAVE';
      const isAbsent = !isPresent && !isOnLeave;

      let matchesStatus = true;
      if (selectedStatus === 'PRESENT') matchesStatus = isPresent;
      else if (selectedStatus === 'LEAVE') matchesStatus = isOnLeave;
      else if (selectedStatus === 'ABSENT') matchesStatus = isAbsent;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, selectedDept, selectedStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-16">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#714B67] font-semibold mb-0.5">
            <Users className="w-4 h-4" />
            <span>Organization Directory</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Employees
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {filteredEmployees.length} {filteredEmployees.length === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Switcher Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#714B67] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Kanban Cards Grid"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#714B67] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* Admin "NEW" Employee Button */}
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#714B67] hover:bg-[#5a3b52] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>NEW</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, role, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40 focus:border-[#714B67]"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departmentOptions.filter((d) => d !== 'ALL').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">🟢 Present in Office</option>
              <option value="LEAVE">✈️ On Leave</option>
              <option value="ABSENT">🟡 Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Views */}
      <div>
        {viewMode === 'kanban' ? (
          <EmployeeKanban employees={filteredEmployees} />
        ) : (
          <EmployeeTable employees={filteredEmployees} />
        )}
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEmployeeAdded={() => setEmployees(storage.getEmployees())}
      />
    </div>
  );
}
