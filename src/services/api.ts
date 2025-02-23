import axios, { AxiosError } from 'axios';
import { SignInCredentials, SignUpCredentials, AuthResponse, ApiErrorResponse, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // Add additional headers for CORS
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.detail || 'An error occurred';
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }
      if (error.message.includes('Network Error') || error.message.includes('CORS')) {
        throw new Error('CORS error: Please ensure the backend server is running and CORS is properly configured');
      }
      throw new Error('Server is not responding. Please try again later.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('An error occurred while sending the request');
    }
  }
);

export const authApi = {
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  register: async (credentials: Omit<SignUpCredentials, 'confirmPassword'>) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        email: credentials.email,
        password: credentials.password,
        full_name: credentials.name,
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to register');
    }
  },

  login: async (credentials: SignInCredentials) => {
    try {
      console.log('Attempting login for user:', credentials.email);
      
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const response = await api.post<{ access_token: string; token_type: string }>(
        '/auth/login/access-token',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        }
      );

      console.log('Auth response:', response.data);

      // Store the token first
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }

      // Get user data with the new token
      const user = await authApi.getCurrentUser();

      // Create the standardized response format
      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name || '',
          full_name: user.full_name || '',
          created_at: user.created_at,
          user_metadata: user.user_metadata
        },
        access_token: response.data.access_token,
        token_type: response.data.token_type
      };

      return authResponse;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to login');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export default api; 