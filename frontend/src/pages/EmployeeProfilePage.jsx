import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storage } from '../data/storage';
import ProfileHeader from '../components/employees/ProfileHeader';
import ResumeTab from '../components/employees/tabs/ResumeTab';
import AttendanceActivityTab from '../components/employees/tabs/AttendanceActivityTab';
import PrivateInfoTab from '../components/employees/tabs/PrivateInfoTab';
import SalaryInfoTab from '../components/employees/tabs/SalaryInfoTab';
import SecurityDocumentsTab from '../components/employees/tabs/SecurityDocumentsTab';
import {
  BookOpen,
  CalendarDays,
  User,
  DollarSign,
  Shield,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Flame
} from 'lucide-react';

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, activeUser, isAdmin, updateActiveProfile } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [saveNotice, setSaveNotice] = useState(false);

  useEffect(() => {
    let target = null;
    if (id) {
      target = storage.getEmployeeById(id);
    } else {
      // /profile defaults to activeUser
      target = activeUser || currentUser || storage.getEmployees()[0];
    }

    if (target) {
      setEmployee(JSON.parse(JSON.stringify(target)));
    }
  }, [id, activeUser, currentUser]);

  if (!employee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Employee Profile Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested profile does not exist in directory records.</p>
        <button
          onClick={() => navigate('/employees')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  const handleFieldChange = (field, value) => {
    setEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    storage.saveEmployee(employee);
    if (employee.id === activeUser?.id) {
      updateActiveProfile(employee);
    }
    setIsEditing(false);
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3500);
  };

  const tabs = [
    { id: 'activity', label: 'Attendance Log & Grid', icon: CalendarDays, badge: 'Live' },
    { id: 'resume', label: 'Work & Resume', icon: BookOpen },
    { id: 'private', label: 'Private Info', icon: User },
    { id: 'salary', label: 'Salary Info', icon: DollarSign },
    { id: 'security', label: 'Security & Docs', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-16">
      {/* Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/employees" className="hover:text-indigo-600 flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Employees Directory</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">{employee.name}</span>
        </div>

        {saveNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Profile changes saved successfully!</span>
          </div>
        )}
      </div>

      {/* Profile Header Block */}
      <ProfileHeader
        employee={employee}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
        onSave={handleSaveProfile}
        onChangeField={handleFieldChange}
        canEditJobDetails={isAdmin}
      />

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-sm flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'activity' && (
          <AttendanceActivityTab
            employee={employee}
            isAdmin={isAdmin}
          />
        )}
        {activeTab === 'resume' && (
          <ResumeTab
            employee={employee}
            isEditing={isEditing}
            onChangeField={handleFieldChange}
          />
        )}
        {activeTab === 'private' && (
          <PrivateInfoTab
            employee={employee}
            isEditing={isEditing}
            onChangeField={handleFieldChange}
          />
        )}
        {activeTab === 'salary' && (
          <SalaryInfoTab
            employee={employee}
            isEditing={isEditing}
            onChangeField={handleFieldChange}
            canEditSalary={isAdmin}
          />
        )}
        {activeTab === 'security' && (
          <SecurityDocumentsTab
            employee={employee}
            isEditing={isEditing}
            onChangeField={handleFieldChange}
          />
        )}
      </div>
    </div>
  );
}
