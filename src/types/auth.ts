export interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  created_at: string;
  user_metadata?: {
    full_name?: string;
    email_verified?: boolean;
    phone_verified?: boolean;
    sub?: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export interface ApiErrorResponse {
  detail: string;
  status_code?: number;
  error_code?: string;
} 