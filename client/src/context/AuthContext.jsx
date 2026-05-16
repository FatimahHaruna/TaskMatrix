import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guest session set by "Continue without account"
    const guest = localStorage.getItem('tm_guest');
    if (guest) {
      setUser(JSON.parse(guest));
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('tm_token');
    if (!token) { setLoading(false); return; }
    authApi.getMe()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem('tm_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    localStorage.setItem('tm_token', token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (displayName, email, password, timezone) => {
    const { token, user: u } = await authApi.register({ displayName, email, password, timezone });
    localStorage.setItem('tm_token', token);
    setUser(u);
    return u;
  }, []);

  const loginAsGuest = useCallback(() => {
    localStorage.removeItem('tm_token');
    const guest = { _id: 'guest', displayName: 'Guest', email: '', isGuest: true };
    localStorage.setItem('tm_guest', JSON.stringify(guest));
    setUser(guest);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_guest');
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    const updated = await authApi.updateMe(data);
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginAsGuest, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
