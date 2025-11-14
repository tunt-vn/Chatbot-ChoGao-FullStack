/**
 * API Client for communicating with the backend
 * Base URL is configured based on the environment
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  from: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Get the JWT token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Set the JWT token in localStorage
 */
const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

/**
 * Remove the JWT token from localStorage
 */
const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

/**
 * Make an API request with optional authentication
 */
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  requiresAuth: boolean = true
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      removeAuthToken();
      window.location.href = '/login';
    }
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
};

/**
 * Authentication API calls
 */
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>('/auth/login', 'POST', {
      email,
      password,
    }, false);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  register: async (email: string, password: string, name: string): Promise<any> => {
    return apiRequest('/auth/register', 'POST', {
      email,
      password,
      name,
    }, false);
  },

  logout: (): void => {
    removeAuthToken();
  },

  forgotPassword: async (email: string): Promise<any> => {
    return apiRequest('/auth/forgot-password', 'POST', { email }, false);
  },

  resetPassword: async (code: string, newPassword: string, email: string): Promise<any> => {
    return apiRequest('/auth/reset-password', 'POST', {
      email,
      code,
      newPassword,
    }, false);
  },

  resendVerificationEmail: async (email: string): Promise<any> => {
    return apiRequest('/auth/resend-verify-mail', 'POST', { email }, false);
  },
};

/**
 * Chat API calls
 */
export const chatApi = {
  sendMessage: async (message: string): Promise<any> => {
    return apiRequest('/chat', 'POST', {
      message,
    }, true);
  },

  getChatHistory: async (): Promise<ChatMessage[]> => {
    return apiRequest('/chat/history', 'GET', undefined, true);
  },
};

/**
 * User API calls
 */
export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    return apiRequest('/user/profile', 'GET', undefined, true);
  },

  updateProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    return apiRequest('/user/profile', 'PUT', profile, true);
  },
};

export default {
  authApi,
  chatApi,
  userApi,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
};
