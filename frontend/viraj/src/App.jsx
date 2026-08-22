import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter } from './router/RouterContext';
import { Layout } from './components/layout/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { PayrollPage } from './pages/PayrollPage';
import './App.css';

function AppRoutes() {
  const { currentPath, isMatch } = useRouter();
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-secondary)' }}>
        Loading Dayflow...
      </div>
    );
  }

  // Determine which page to render based on current route and auth state
  const renderRoute = () => {
    // Public Auth Routes
    if (currentPath === '/login') {
      return <LoginForm />;
    }
    if (currentPath === '/signup') {
      return <SignUpForm />;
    }

    // Protected Route Enforcement: If unauthenticated, render LoginForm
    if (!currentUser) {
      return <LoginForm />;
    }

    // Primary Application Routes
    if (currentPath === '/employees' || currentPath === '/') {
      return <EmployeesPage />;
    }

    if (isMatch('/employees/:id') || currentPath === '/profile') {
      return <EmployeeProfilePage />;
    }

    if (currentPath === '/payroll') {
      return <PayrollPage />;
    }

    // Default fallback to Employees directory
    return <EmployeesPage />;
  };

  return <Layout>{renderRoute()}</Layout>;
}

export function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;

