
// Fix the TypeScript errors related to missing password property
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/models/types';

interface AuthContextProps extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  // This would normally verify the token with your backend
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Mock user data - In a real app, you would verify the token with your backend
          // and get the user data
          const user: User = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            password: '', // Added password property to fix TypeScript error
            createdAt: new Date(),
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, you would send the credentials to your backend
      // and receive a token and user data in response
      
      // Mock successful login
      const user: User = {
        id: '1',
        name: 'John Doe',
        email,
        role: email.includes('admin') ? 'admin' : 'customer',
        password: '', // Added password property to fix TypeScript error
        createdAt: new Date(),
      };
      
      // Save token to localStorage
      localStorage.setItem('authToken', 'mock-token');
      
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // In a real app, you would send the registration data to your backend
      
      // Mock successful registration
      const user: User = {
        id: Date.now().toString(),
        name,
        email,
        role: 'customer',
        password: '', // We're not storing the real password here for security
        createdAt: new Date(),
      };
      
      // Save token to localStorage
      localStorage.setItem('authToken', 'mock-token');
      
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed. Please try again.');
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    
    // Reset auth state
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  // Additional helper for checking admin status
  const isAdmin = authState.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
