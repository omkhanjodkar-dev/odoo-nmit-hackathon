import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '../../data/storage';
import SystrayAttendance from '../attendance/SystrayAttendance';
import {
  Users,
  Clock,
  Plane,
  CreditCard,
  LayoutDashboard,
  Shield,
  UserCheck,
  ChevronDown,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());
  const [employees] = useState(() => storage.getEmployees());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const unsub = storage.subscribe(STORAGE_KEYS.CURRENT_USER, (user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleSwitchUser = (emp) => {
    storage.setCurrentUser(emp);
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/time-off', label: 'Time Off', icon: Plane },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#714B67] text-white shadow-md border-b border-[#5a3b52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Main Nav Tabs (Odoo Style) */}
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl text-white shadow-inner group-hover:scale-105 transition-transform">
                D
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Dayflow <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/20 text-purple-100">HRMS</span>
                </span>
                <p className="text-[10px] text-purple-200 leading-none -mt-0.5">Odoo Enterprise Suite</p>
              </div>
            </NavLink>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-purple-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Compact Systray Clock & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Live Systray Widget in Navbar */}
            <div className="hidden sm:block">
              <SystrayAttendance compact={true} />
            </div>

            {/* Role & User Profile Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-lg object-cover border border-white/30"
                />
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-bold leading-none text-white">{currentUser?.name}</p>
                  <p className="text-[10px] text-purple-200 mt-0.5 font-medium">
                    {currentUser?.role === 'ADMIN_HR' ? '👑 HR Admin' : '👤 Employee'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-purple-200" />
              </button>

              {/* Dropdown Menu for Quick User / Role Switching */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 text-gray-800 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logged In As</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{currentUser?.name}</p>
                    <p className="text-xs text-purple-700 font-semibold">{currentUser?.role === 'ADMIN_HR' ? 'HR Administrator' : 'Staff Employee'}</p>
                  </div>

                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Switch Role Demo Perspective
                    </p>
                    <div className="space-y-1">
                      {employees.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => handleSwitchUser(emp)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            currentUser?.id === emp.id
                              ? 'bg-purple-50 text-purple-900 font-bold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={emp.avatar} alt={emp.name} className="w-5 h-5 rounded-full object-cover" />
                            <span className="truncate">{emp.name}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold shrink-0">
                            {emp.role === 'ADMIN_HR' ? 'ADMIN' : 'EMP'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-2 pt-1">
                    <button
                      onClick={() => {
                        storage.reset();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 font-bold hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Reset Demo Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around bg-[#5a3b52] px-2 py-1.5 border-t border-[#432c3d]">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-md text-xs font-semibold ${
                isActive ? 'text-white bg-white/20' : 'text-purple-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </header>
  );
}
