import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import AttendancePage from './pages/AttendancePage';
import TimeOffPage from './pages/TimeOffPage';
import PayrollPage from './pages/PayrollPage';

function ProtectedLayout({ children, adminOnly = false }) {
  const { currentUser, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs font-bold">
        Loading Dayflow HRMS Workspace...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (adminOnly && !isAdmin) {
    // Non-admins attempting to access admin-only pages (e.g. employee directory) are redirected to dashboard
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans antialiased text-slate-900 selection:bg-purple-100 selection:text-[#714B67]">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/signin"
        element={currentUser ? <Navigate to="/" replace /> : <SignInPage />}
      />
      <Route
        path="/signup"
        element={currentUser ? <Navigate to="/" replace /> : <SignUpPage />}
      />

      {/* Protected Main Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedLayout adminOnly={true}>
            <EmployeesPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedLayout>
            <EmployeeProfilePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedLayout>
            <EmployeeProfilePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedLayout>
            <AttendancePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/time-off"
        element={
          <ProtectedLayout>
            <TimeOffPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/payroll"
        element={
          <ProtectedLayout>
            <PayrollPage />
          </ProtectedLayout>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
