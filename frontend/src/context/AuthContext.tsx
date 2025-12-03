import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token && mounted) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setLoading(false);
          } else {
            // Fetch user from API if not in localStorage
            try {
              const response = await authService.getCurrentUser();
              if (response.success && response.data && mounted) {
                setUser(response.data);
                authService.setStoredUser(response.data);
              }
            } catch (error) {
              console.error('Failed to fetch user:', error);
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        const { token, user } = response.data;
        authService.setToken(token);
        authService.setStoredUser(user);
        setUser(user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        throw new Error(errorData.errors.join(', '));
      }
      throw new Error(errorData?.message || error.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      if (response.success && response.data) {
        const { token, user } = response.data;
        authService.setToken(token);
        authService.setStoredUser(user);
        setUser(user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      // Extract validation errors if they exist
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        throw new Error(errorData.errors.join(', '));
      }
      throw new Error(errorData?.message || error.message || 'Registration failed');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    authService.setStoredUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};