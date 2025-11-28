# 🔄 Hướng Dẫn Cập Nhật Frontend cho Tính Năng Bảo Mật Mới

## 📋 Tổng Quan

Backend đã được cập nhật với các tính năng bảo mật mới. Tài liệu này hướng dẫn cách cập nhật frontend để tương thích.

---

## 🔄 Thay Đổi Chính

### 1. HttpOnly Cookies thay vì localStorage
### 2. Refresh Token Mechanism
### 3. API Versioning Support
### 4. Rate Limiting Handling

---

## 📝 Cập Nhật API Service

### File: `src/services/api.ts`

#### Cập nhật API Client

```typescript
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ⚠️ QUAN TRỌNG: Cho phép gửi cookies
});

// Request interceptor (không cần thêm token vì dùng cookies)
apiClient.interceptors.request.use(
  (config) => {
    // Cookies tự động được gửi với withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor với refresh token logic
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đợi refresh token hoàn thành
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Lấy refresh token từ localStorage (hoặc có thể lưu ở đâu đó)
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi API refresh
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        // Lưu refresh token mới (nếu có)
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }

        isRefreshing = false;
        processQueue(null, response.data.accessToken);

        // Retry request gốc
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Xóa tokens và redirect về login
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    // Xử lý rate limiting (429)
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
      // Có thể show notification cho user
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔐 Cập Nhật Auth Service

### File: `src/services/authService.ts`

```typescript
import apiClient from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

class AuthService {
  /**
   * Login với email và password
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>(
      '/api/auth/login',
      credentials
    );
    
    // Lưu refresh token vào localStorage
    // Access token được lưu trong HttpOnly cookie
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  }

  /**
   * Login với Google
   */
  async loginWithGoogle(code: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>(
      '/api/auth/google',
      { code }
    );
    
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      // Xóa refresh token
      localStorage.removeItem('refreshToken');
      // Cookies sẽ tự động bị xóa bởi backend
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<TokenResponse>(
      '/api/auth/refresh',
      { refreshToken }
    );

    // Cập nhật refresh token nếu có mới
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Register
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<void> {
    await apiClient.post('/api/auth/register', data);
  }

  /**
   * Kiểm tra user có đang login không
   */
  isAuthenticated(): boolean {
    // Kiểm tra có refresh token không
    return !!localStorage.getItem('refreshToken');
  }
}

export default new AuthService();
```

---

## 🎯 Cập Nhật Auth Context

### File: `src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { User, TokenResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra authentication khi app load
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        // Có thể gọi API để lấy thông tin user
        // const userData = await apiClient.get('/api/user/me');
        // setUser(userData.data);
        
        // Hoặc đơn giản set authenticated
        setUser({ id: 0, email: '', name: '', role: 'USER' }); // Placeholder
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      // User info có thể được lấy từ response hoặc gọi API riêng
      await checkAuth();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (code: string) => {
    try {
      await authService.loginWithGoogle(code);
      await checkAuth();
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Vẫn clear user state ngay cả khi API call fail
      setUser(null);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await authService.register({ email, password, name });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        register,
      }}
    >
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
```

---

## 🚨 Xử Lý Rate Limiting

### File: `src/components/RateLimitNotification.tsx`

```typescript
import React, { useEffect, useState } from 'react';

interface RateLimitNotificationProps {
  show: boolean;
  onClose: () => void;
}

export const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({
  show,
  onClose,
}) => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (show) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="rate-limit-notification">
      <div className="notification-content">
        <h3>⚠️ Quá nhiều yêu cầu</h3>
        <p>Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau {countdown} giây.</p>
      </div>
    </div>
  );
};
```

### Sử dụng trong component

```typescript
import { useState } from 'react';
import { RateLimitNotification } from './RateLimitNotification';

function MyComponent() {
  const [showRateLimit, setShowRateLimit] = useState(false);

  const handleApiCall = async () => {
    try {
      await apiClient.post('/api/some-endpoint', data);
    } catch (error: any) {
      if (error.response?.status === 429) {
        setShowRateLimit(true);
      }
    }
  };

  return (
    <>
      <button onClick={handleApiCall}>Call API</button>
      <RateLimitNotification
        show={showRateLimit}
        onClose={() => setShowRateLimit(false)}
      />
    </>
  );
}
```

---

## 🔢 Sử Dụng API Versioning

### Option 1: Sử dụng version cụ thể

```typescript
// Sử dụng v1
const response = await apiClient.get('/api/v1/chat/history');

// Sử dụng v2 (future)
const response = await apiClient.get('/api/v2/chat/history');
```

### Option 2: Cấu hình version mặc định

```typescript
// src/config/api.ts
export const API_VERSION = 'v1';

// src/services/api.ts
const getVersionedUrl = (path: string) => {
  if (path.startsWith('/api/v')) {
    return path; // Đã có version
  }
  return path.replace('/api/', `/api/${API_VERSION}/`);
};

// Sử dụng
const response = await apiClient.get(getVersionedUrl('/api/chat/history'));
```

---

## 📦 Cập Nhật Environment Variables

### File: `.env.local`

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_API_VERSION=v1

# Cookie Configuration (for development)
VITE_COOKIE_DOMAIN=localhost
```

### File: `.env.production`

```env
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_VERSION=v1

# Cookie Configuration
VITE_COOKIE_DOMAIN=yourdomain.com
```

---

## ✅ Checklist Migration

### Backend Ready
- [x] HttpOnly cookies implemented
- [x] Refresh token mechanism
- [x] Rate limiting
- [x] Audit logging
- [x] API versioning

### Frontend Updates Needed
- [ ] Update `api.ts` với `withCredentials: true`
- [ ] Implement refresh token logic
- [ ] Remove token từ localStorage (chỉ giữ refreshToken)
- [ ] Update AuthContext
- [ ] Add rate limit handling
- [ ] Test all authentication flows
- [ ] Update API calls để sử dụng versioning (optional)

---

## 🧪 Testing

### Test Login Flow

```typescript
// Test login
const result = await authService.login({
  email: 'test@example.com',
  password: 'password123'
});

console.log('Login successful:', result);
console.log('Refresh token saved:', localStorage.getItem('refreshToken'));
```

### Test Refresh Token

```typescript
// Đợi access token hết hạn (15 phút) hoặc test ngay
const result = await authService.refreshToken();
console.log('Token refreshed:', result);
```

### Test Logout

```typescript
await authService.logout();
console.log('Logged out');
console.log('Refresh token removed:', !localStorage.getItem('refreshToken'));
```

### Test Rate Limiting

```typescript
// Gửi nhiều requests liên tiếp
for (let i = 0; i < 150; i++) {
  try {
    await apiClient.get('/api/some-endpoint');
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.log('Rate limit hit at request', i);
      break;
    }
  }
}
```

---

## 🔧 Troubleshooting

### Lỗi: "Cookies không được set"

**Nguyên nhân**: CORS configuration hoặc `withCredentials` chưa đúng

**Giải pháp**:
```typescript
// Đảm bảo withCredentials: true
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ⚠️ QUAN TRỌNG
});
```

Backend CORS config:
```java
// CorsConfig.java
.allowCredentials(true)
.allowedOrigins("http://localhost:5173")
```

### Lỗi: "Refresh token failed"

**Nguyên nhân**: Refresh token hết hạn hoặc không hợp lệ

**Giải pháp**:
- User cần đăng nhập lại
- Kiểm tra refresh token có trong localStorage không
- Kiểm tra backend logs

### Lỗi: "Rate limit exceeded"

**Nguyên nhân**: Gửi quá nhiều requests

**Giải pháp**:
- Đợi 1 phút
- Implement debouncing cho user actions
- Cache API responses

---

## 📚 Best Practices

### 1. Token Management
```typescript
// ✅ ĐÚNG: Chỉ lưu refresh token
localStorage.setItem('refreshToken', token);

// ❌ SAI: Không lưu access token (đã có trong cookie)
localStorage.setItem('accessToken', token); // Không cần
```

### 2. API Calls
```typescript
// ✅ ĐÚNG: Luôn dùng withCredentials
axios.get(url, { withCredentials: true });

// ❌ SAI: Quên withCredentials
axios.get(url); // Cookies sẽ không được gửi
```

### 3. Error Handling
```typescript
// ✅ ĐÚNG: Handle tất cả error cases
try {
  await apiCall();
} catch (error: any) {
  if (error.response?.status === 401) {
    // Unauthorized - try refresh
  } else if (error.response?.status === 429) {
    // Rate limit - show notification
  } else {
    // Other errors
  }
}
```

### 4. Logout
```typescript
// ✅ ĐÚNG: Clear tất cả tokens
await authService.logout();
localStorage.removeItem('refreshToken');

// ❌ SAI: Quên clear refresh token
await authService.logout(); // Chỉ clear cookies
```

---

## 🎉 Kết Luận

Sau khi hoàn thành migration:

✅ **Security**: Tăng cường với HttpOnly cookies  
✅ **UX**: Tự động refresh token, không cần login lại thường xuyên  
✅ **Reliability**: Rate limiting bảo vệ backend  
✅ **Maintainability**: API versioning cho phép update dễ dàng  

**Next Steps**:
1. Test thoroughly trên development
2. Deploy lên staging
3. User acceptance testing
4. Deploy lên production

---

**Ngày cập nhật**: November 14, 2025  
**Version**: 1.0.0
