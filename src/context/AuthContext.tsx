import React, { createContext, useContext, useState, useEffect } from 'react';
import { SignInCredentials, SignUpCredentials } from '../types/auth';

interface User {
  email: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: SignInCredentials) => Promise<void>;
  register: (credentials: SignUpCredentials) => Promise<void>;
  logout: () => void;
  accessToken: string | null;
}

const initialContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  accessToken: null,
};

export const AuthContext = createContext<AuthContextType>(initialContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize states from localStorage
  const storedToken = localStorage.getItem('accessToken');
  const storedUser = localStorage.getItem('user');

  const [user, setUser] = useState<User | null>(() => {
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!storedToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(storedToken);

  const login = async (credentials: SignInCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login/access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: credentials.email,
          password: credentials.password,
          grant_type: 'password',
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userData = { email: credentials.email };
      
      // Store both token and user data
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setAccessToken(data.access_token);
      setIsAuthenticated(true);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      setIsAuthenticated(false);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: SignUpCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      await login({ email: credentials.email, password: credentials.password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  };

  // Verify token validity on mount and after token changes
  useEffect(() => {
    const verifyAuth = async () => {
      if (!accessToken) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Token verification failed');
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error('Token verification failed:', err);
        setIsAuthenticated(false);
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    };

    verifyAuth();
  }, [accessToken]);

  // Auto-login with credentials from env if needed
  useEffect(() => {
    const autoLogin = async () => {
      // If we already have a token, no need to auto-login
      if (accessToken) {
        return;
      }

      const username = import.meta.env.VITE_USER;
      const password = import.meta.env.VITE_PASSWORD;

      if (username && password) {
        try {
          await login({ email: username, password: password });
        } catch (err) {
          console.error('Auto-login error:', err);
        }
      }
    };

    autoLogin();
  }, []); // Run only once on mount

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    accessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 