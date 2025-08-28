import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User>({
    _id: '60d5ecb8b4854b323c108a8a',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
  });

  return (
    <AuthContext.Provider value={{
      user,
      isLoading: false,
      isAuthenticated: true
    }}>
      {children}
    </AuthContext.Provider>
  );
};