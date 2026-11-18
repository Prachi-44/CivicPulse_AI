import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string, ward?: string, phone?: string) => Promise<User>;
  logout: () => void;
  setFastDemoUser: (role: 'admin' | 'supervisor' | 'citizen') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('civicpulse_token');
    const savedUser = localStorage.getItem('civicpulse_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (_) {
        localStorage.removeItem('civicpulse_token');
        localStorage.removeItem('civicpulse_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await authApi.login({ email, password: pass });
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('civicpulse_token', receivedToken);
    localStorage.setItem('civicpulse_user', JSON.stringify(receivedUser));
    return receivedUser;
  };

  const register = async (name: string, email: string, pass: string, ward?: string, phone?: string): Promise<User> => {
    const res = await authApi.register({ name, email, password: pass, ward, phone });
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('civicpulse_token', receivedToken);
    localStorage.setItem('civicpulse_user', JSON.stringify(receivedUser));
    return receivedUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('civicpulse_token');
    localStorage.removeItem('civicpulse_user');
  };

  const setFastDemoUser = async (role: 'admin' | 'supervisor' | 'citizen') => {
    if (role === 'admin') {
      await login('admin@civicpulse.in', 'Admin@2025');
    } else if (role === 'supervisor') {
      await login('supervisor@civicpulse.in', 'Admin@2025');
    } else {
      await login('aditya@example.com', 'Citizen@2025');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        setFastDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
