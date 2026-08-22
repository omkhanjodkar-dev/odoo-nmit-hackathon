import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from './Header';
import './Layout.css';

export const Layout = ({ children }) => {
  const { currentPath } = useRouter();
  const { isImpersonating, impersonatedUser, switchContext } = useAuth();

  const isAuthPage = currentPath === '/login' || currentPath === '/signup';

  if (isAuthPage) {
    return <div className="app-auth-wrapper">{children}</div>;
  }

  return (
    <div className="app-layout">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="impersonation-banner">
          <div className="impersonation-content">
            <span className="impersonation-icon">👁️</span>
            <span>
              <strong>Context Active:</strong> You are currently previewing Dayflow as{' '}
              <strong>{impersonatedUser?.first_name} {impersonatedUser?.last_name}</strong> ({impersonatedUser?.designation} - {impersonatedUser?.department}).
            </span>
          </div>
          <button
            type="button"
            className="impersonation-exit-btn"
            onClick={() => switchContext(null)}
          >
            Exit Impersonation
          </button>
        </div>
      )}

      {/* Main Header & Systray */}
      <Header />

      {/* Main Content Area */}
      <main className="app-main">
        <div className="app-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
