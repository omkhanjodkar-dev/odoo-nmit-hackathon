import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../data/storage';
import SystrayAttendance from '../attendance/SystrayAttendance';
import {
  LayoutDashboard,
  Users,
  Clock,
  Plane,
  DollarSign,
  ChevronDown,
  User,
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { activeUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // Nav links: "Employees" tab is strictly visible to Admin only
  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { to: '/employees', label: 'Employees', icon: Users, adminOnly: true },
    { to: '/attendance', label: 'Attendance', icon: Clock, adminOnly: false },
    { to: '/time-off', label: 'Time Off', icon: Plane, adminOnly: false },
    { to: '/payroll', label: 'Payroll', icon: DollarSign, adminOnly: false },
  ].filter((link) => !link.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white shadow-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Nav Tabs */}
          <div className="flex items-center gap-6 lg:gap-8">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-xl text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                D
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5 leading-none">
                  Dayflow <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">HRMS</span>
                </span>
                <p className="text-[10px] text-slate-400 leading-none mt-1 font-medium">Enterprise Suite</p>
              </div>
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.to === '/'
                    ? location.pathname === '/' || location.pathname === '/dashboard'
                    : location.pathname.startsWith(link.to);

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-90" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Compact Systray Clock & Profile Menu */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Systray Widget in Navbar */}
            <div className="hidden sm:block">
              <SystrayAttendance compact={true} />
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-all border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <img
                  src={activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={activeUser?.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-600"
                />
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-bold leading-none text-white truncate max-w-[120px]">
                    {activeUser?.name}
                  </p>
                  <p className="text-[10px] text-indigo-300 mt-0.5 font-medium">
                    {isAdmin ? '👑 HR Admin' : '👤 Employee'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 text-slate-800 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed In As</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{activeUser?.name}</p>
                    <p className="text-xs font-semibold text-indigo-600">
                      {isAdmin ? 'HR Administrator' : activeUser?.designation || 'Staff Employee'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">{activeUser?.email}</p>
                  </div>

                  {/* Links */}
                  <div className="px-2 py-1.5 border-b border-slate-100">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors flex items-center gap-2.5"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>My Profile</span>
                    </button>
                  </div>

                  {/* Reset & Logout */}
                  <div className="px-2 pt-1.5 space-y-1">
                    <button
                      onClick={() => {
                        storage.reset();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-amber-600 font-bold hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Reset Demo Data</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 px-4 pt-2 pb-4 border-t border-slate-800 space-y-2 animate-fadeIn">
          <div className="py-2">
            <SystrayAttendance compact={true} />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.to === '/'
                  ? location.pathname === '/' || location.pathname === '/dashboard'
                  : location.pathname.startsWith(link.to);

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
