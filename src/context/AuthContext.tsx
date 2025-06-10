import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

// Mock user data for demonstration
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Agent User',
    email: 'agent@example.com',
    role: UserRole.AGENT,
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Client User',
    email: 'client@example.com',
    role: UserRole.CLIENT,
    companyId: '1',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: () => {},
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

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (in a real app, this would be a server validation)
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      // Generate a mock token (in a real app, this would come from the server)
      const mockToken = btoa(`${foundUser.id}:${Date.now()}`);
      
      // Store user and token in state and localStorage
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      localStorage.setItem('authToken', mockToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};