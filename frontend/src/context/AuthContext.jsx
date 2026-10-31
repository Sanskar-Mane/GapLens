import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiSignup, apiLogout, apiGetMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('gaplens_auth_user') || localStorage.getItem('gaplens_user');
        return stored ? JSON.parse(stored) : null;
      } catch (err) {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gaplens_auth_token') || null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Validate session on mount if token exists
  useEffect(() => {
    let isMounted = true;
    if (token) {
      apiGetMe()
        .then((res) => {
          if (!isMounted) return;
          if (res?.success && res.user) {
            setUser(res.user);
            if (typeof window !== 'undefined') {
              localStorage.setItem('gaplens_user', JSON.stringify(res.user));
              localStorage.setItem('gaplens_auth_user', JSON.stringify(res.user));
            }
          }
        })
        .catch(() => {
          // Keep current state on error
        });
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  const loginAsDemo = (demoEmail = '') => {
    const emailToUse = demoEmail && demoEmail.trim() ? demoEmail.trim() : 'demo@gaplens.local';
    const demoUser = {
      id: 'demo-user-' + Date.now(),
      email: emailToUse,
      role: 'authenticated',
      isLocalDemo: true,
      created_at: new Date().toISOString(),
    };
    const demoToken = 'mock-jwt-token';

    setUser(demoUser);
    setToken(demoToken);

    if (typeof window !== 'undefined') {
      localStorage.setItem('gaplens_auth_user', JSON.stringify(demoUser));
      localStorage.setItem('gaplens_user', JSON.stringify(demoUser));
      localStorage.setItem('gaplens_auth_token', demoToken);
    }
    return { success: true, user: demoUser };
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, password);
      if (res?.success) {
        const authUser = res.user || { email, id: 'usr_demo' };
        const authToken = res.session?.access_token || 'mock-jwt-token';

        setUser(authUser);
        setToken(authToken);

        if (typeof window !== 'undefined') {
          localStorage.setItem('gaplens_user', JSON.stringify(authUser));
          localStorage.setItem('gaplens_auth_user', JSON.stringify(authUser));
          localStorage.setItem('gaplens_auth_token', authToken);
        }
        return { success: true, user: authUser };
      }
      throw new Error(res?.message || res?.msg || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await apiSignup(email, password);
      if (res?.success) {
        const authUser = res.user || { email, id: 'usr_' + Date.now() };
        const authToken = res.session?.access_token || 'mock-jwt-token';

        setUser(authUser);
        setToken(authToken);

        if (typeof window !== 'undefined') {
          localStorage.setItem('gaplens_user', JSON.stringify(authUser));
          localStorage.setItem('gaplens_auth_user', JSON.stringify(authUser));
          localStorage.setItem('gaplens_auth_token', authToken);
        }
        return { success: true, user: authUser };
      }
      throw new Error(res?.message || res?.msg || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
    } catch (err) {
      // Ignore logout error
    } finally {
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gaplens_user');
        localStorage.removeItem('gaplens_auth_user');
        localStorage.removeItem('gaplens_auth_token');
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        loginAsDemo,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

