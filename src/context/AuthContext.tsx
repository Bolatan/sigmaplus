import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types'; // UserRole can be removed if not used directly here

// MOCK_USERS array removed

interface AuthContextType {
  user: User | null; // User type should match what backend login returns (e.g., _id, name, email, role, companyId)
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
    // Check for saved token and user in localStorage to rehydrate session
    const token = localStorage.getItem('authToken');
    const savedUserString = localStorage.getItem('user');
    if (token && savedUserString) {
      try {
        const savedUser = JSON.parse(savedUserString);
        // It's good practice to ensure the savedUser object has expected properties
        if (savedUser && savedUser._id && savedUser.email && savedUser.role) {
          setUser(savedUser);
        } else {
          // Invalid user object, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      } catch (e) {
        console.error("Error parsing saved user from localStorage", e);
        localStorage.removeItem('user'); // Clear corrupted user data
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Assuming error response is like { errors: [{ msg: '...' }] } or { error: '...' }
        const errorMessage = data.errors ? data.errors[0].msg : (data.error || data.msg || 'Login failed');
        throw new Error(errorMessage);
      }
      
      // Backend now returns { token, user: { _id, name, email, role, companyId?, branding? } }
      if (data.token && data.user) {
        setUser(data.user); // Set user state with the user object from backend
        localStorage.setItem('user', JSON.stringify(data.user)); // Store user object
        localStorage.setItem('authToken', data.token); // Store JWT token
      } else {
        throw new Error('Login response did not include token or user information.');
      }

    } catch (error: any) {
      console.error('Login API error:', error);
      // Ensure the error thrown can be caught by the Login page UI
      throw error; // Re-throw the error to be handled by the calling component
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