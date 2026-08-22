import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext(null);

const normalizePath = (path) => {
  if (!path) return '/employees';
  const clean = path.split('?')[0].split('#')[0];
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean === '/' ? '/employees' : clean;
};

export const RouterProvider = ({ children }) => {
  // Initialize route from window.location.pathname or default to '/employees'
  const getInitialPath = () => {
    return normalizePath(window.location.pathname);
  };

  const [currentPath, setCurrentPath] = useState(getInitialPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    const normPath = normalizePath(path);
    if (normPath !== currentPath) {
      window.history.pushState({}, '', normPath);
      setCurrentPath(normPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to extract route parameters e.g. /employees/:id
  const getRouteParam = (pattern) => {
    // pattern e.g. "/employees/:id"
    const patternParts = pattern.split('/');
    const currentParts = currentPath.split('/');

    if (patternParts.length !== currentParts.length) return null;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        return currentParts[i];
      }
      if (patternParts[i] !== currentParts[i]) {
        return null;
      }
    }
    return null;
  };

  const isMatch = (pattern) => {
    if (pattern === currentPath) return true;
    if (pattern.includes(':')) {
      return getRouteParam(pattern) !== null;
    }
    return false;
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate, isMatch, getRouteParam }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

