import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import useApi from '../hooks/useApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuthToken: (token: string) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  setAuthToken: () => {},
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  const setAuthToken = (token: string) => {
    localStorage.setItem('authToken', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUserString = localStorage.getItem('user');
    if (token && savedUserString) {
      try {
        const savedUser = JSON.parse(savedUserString);
        setUser(savedUser);
        setAuthToken(token);
      } catch (e) {
        console.error("Error parsing saved user from localStorage", e);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password:string) => {
    setIsLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (data.token && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthToken(data.token);
      } else {
        throw new Error('Login response did not include token or user information.');
      }
    } catch (error: any) {
      console.error('Login API error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      setAuthToken,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};