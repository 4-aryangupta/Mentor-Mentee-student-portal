import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAccessToken } from '../services/api.js';

const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);
  const applySession = (data) => {
    setToken(data.accessToken); setAccessToken(data.accessToken); setUser(data.user);
  };
  useEffect(() => {
    let active = true;
    api.post('/auth/refresh').then(({ data }) => { if (active) applySession(data.data); })
      .catch(() => { if (active) { setUser(null); setToken(null); setAccessToken(null); } })
      .finally(() => { if (active) setReady(true); });
    const expire = () => { setUser(null); setToken(null); setAccessToken(null); };
    window.addEventListener('portal:session-expired', expire);
    return () => { active = false; window.removeEventListener('portal:session-expired', expire); };
  }, []);
  const login = async (credentials) => { const { data } = await api.post('/auth/login', credentials); applySession(data.data); return data.data.user; };
  const register = async (details) => { const { data } = await api.post('/auth/register', details); applySession(data.data); return data.data.user; };
  const logout = async () => { try { await api.post('/auth/logout'); } finally { setUser(null); setToken(null); setAccessToken(null); } };
  const value = useMemo(() => ({ user, token, ready, login, register, logout, setUser }), [user, token, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
