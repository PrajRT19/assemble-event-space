
// Fix the TypeScript errors related to missing password property
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/models/types';
import { toast } from "sonner";

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
          // Get stored user data if available
          const storedUserData = localStorage.getItem('userData');
          
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            
            // Mock user data - In a real app, you would verify the token with your backend
            const user: User = {
              id: userData.id || '1',
              name: userData.name || 'John Doe',
              email: userData.email || 'john@example.com',
              role: userData.role || 'admin',
              password: '', // Added password property to fix TypeScript error
              createdAt: new Date(userData.createdAt) || new Date(),
            };
            
            setAuthState({
              user,
              isAuthenticated: true,
              loading: false,
            });
            
            console.log("Auth status checked, user is authenticated:", user.email);
          } else {
            // Token exists but no user data, clear token as it might be invalid
            localStorage.removeItem('authToken');
            setAuthState({
              user: null,
              isAuthenticated: false,
              loading: false,
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
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
      
      // Also save user data to localStorage
      localStorage.setItem('userData', JSON.stringify(user));
      
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
      
      toast.success("Login successful!");
      console.log("Login successful for:", email);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error("Login failed. Please check your credentials.");
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
      
      // Also save user data to localStorage
      localStorage.setItem('userData', JSON.stringify(user));
      
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
      
      toast.success("Registration successful!");
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error("Registration failed. Please try again.");
      throw new Error('Registration failed. Please try again.');
    }
  };

  const logout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Reset auth state
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    
    toast.info("Logged out successfully");
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
