import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getUser as getStoredUser, login as doLogin, logout as doLogout } from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    // sync state with localStorage changes from other tabs
    function onStorage(e) {
      if (e.key === 'url_shortener_auth_v1') {
        setUser(getStoredUser());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login: (username) => {
      const u = doLogin(username);
      setUser(u);
      return u;
    },
    logout: () => {
      doLogout();
      setUser(null);
    },
  }), [user]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
