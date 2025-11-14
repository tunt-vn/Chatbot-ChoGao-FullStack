# 🔐 Hướng Dẫn Sử Dụng Tính Năng Đăng Nhập & Đăng Ký

## 📋 Tổng Quan

Hệ thống xác thực (Authentication) đã được tích hợp hoàn chỉnh với:
- ✅ Trang Đăng Nhập (Login)
- ✅ Trang Đăng Ký (Register)
- ✅ Quên Mật Khẩu (Forgot Password)
- ✅ Đặt Lại Mật Khẩu (Reset Password)
- ✅ Thông Tin Cá Nhân (Profile)
- ✅ Bảo Vệ Tuyến Đường (Protected Routes)

---

## 🚀 Tính Năng

### 1. **Đăng Ký Tài Khoản** (`/register`)
Người dùng có thể tạo tài khoản mới với:
- ✅ Nhập Họ Tên
- ✅ Nhập Email
- ✅ Nhập Mật Khẩu
- ✅ Xác Nhận Mật Khẩu
- ✅ Đồng Ý Điều Khoản Dịch Vụ
- ✅ Xác Thực Email tự động

**Validation:**
- Họ tên tối thiểu 2 ký tự
- Email phải hợp lệ
- Mật khẩu tối thiểu 6 ký tự
- Mật khẩu phải khớp

---

### 2. **Đăng Nhập** (`/login`)
Người dùng có thể đăng nhập với:
- ✅ Email
- ✅ Mật Khẩu
- ✅ Nút "Hiện/Ẩn mật khẩu"
- ✅ Link "Quên mật khẩu?"
- ✅ Link "Đăng ký"

**Token Management:**
- JWT Token tự động lưu vào `localStorage`
- Token tự động gửi kèm mỗi request
- Token hết hạn → Tự động redirect đến login

---

### 3. **Quên Mật Khẩu** (`/forgot-password`)
Người dùng có thể yêu cầu đặt lại mật khẩu:
- ✅ Nhập email
- ✅ Nhận hướng dẫn qua email
- ✅ Email validation

---

### 4. **Đặt Lại Mật Khẩu** (`/reset-password?code=xxx`)
Người dùng có thể đặt mật khẩu mới:
- ✅ Kiểm tra mã reset
- ✅ Nhập mật khẩu mới
- ✅ Xác nhận mật khẩu

---

### 5. **Thông Tin Cá Nhân** (`/profile`)
Xem thông tin người dùng:
- ✅ Avatar
- ✅ Họ tên
- ✅ Email
- ✅ Vai trò (Role)
- ✅ Button cập nhật thông tin
- ✅ Button đổi mật khẩu

---

## 🔒 Bảo Vệ Tuyến Đường (Protected Routes)

Một số tuyến đường cần xác thực:
```
/chat      → Chỉ người dùng đã đăng nhập
/admin     → Chỉ người dùng đã đăng nhập
/profile   → Chỉ người dùng đã đăng nhập
```

Nếu chưa đăng nhập → Tự động redirect đến `/login`

---

## 💾 Dữ Liệu Được Lưu

### localStorage
```javascript
{
  authToken: "eyJhbGciOiJIUzI1NiJ9..."  // JWT Token
}
```

### AuthContext State
```typescript
{
  isAuthenticated: boolean     // Đã đăng nhập?
  user: {
    id: string                 // ID người dùng
    email: string              // Email
    name: string               // Họ tên
    role: string               // Vai trò (USER, ADMIN)
  }
  loading: boolean             // Đang tải?
  error: string | null         // Lỗi nếu có
  login: (email, password) => void
  register: (email, password, name) => void
  logout: () => void
}
```

---

## 🎨 Giao Diện

### Login Page
```
┌─────────────────────────────────────┐
│                                     │
│              Đăng Nhập              │
│       Chào mừng quay lại...         │
│                                     │
│  [Email input field]                │
│  [Password input field]             │
│  [Show/Hide password button]        │
│                                     │
│  [Login button]                     │
│                                     │
│  Chưa có tài khoản? Đăng Ký Ngay    │
│  Quên mật khẩu?                     │
│                                     │
└─────────────────────────────────────┘
```

### Register Page
```
┌─────────────────────────────────────┐
│                                     │
│              Đăng Ký                │
│       Tạo tài khoản mới...          │
│                                     │
│  [Name input field]                 │
│  [Email input field]                │
│  [Password input field]             │
│  [Confirm password field]           │
│  [Agree to terms checkbox]          │
│                                     │
│  [Register button]                  │
│                                     │
│  Đã có tài khoản? Đăng Nhập         │
│                                     │
└─────────────────────────────────────┘
```

### Header (After Login)
```
┌─────────────────────────────────────┐
│ [Menu] Xin chào, Nguyễn Văn A [N]▼ │
│                      │ Thông tin... │
│                      │ Đăng xuất    │
└─────────────────────────────────────┘
```

---

## 🔄 Quy Trình Đăng Nhập

```
User clicks Login button
        ↓
Navigate to /login
        ↓
User enters email & password
        ↓
Validate form data
        ↓
Send request to backend
        ↓
Backend validates credentials
        ↓
Backend returns JWT token
        ↓
Frontend saves token to localStorage
        ↓
AuthContext updates state
        ↓
Redirect to Home page
        ↓
All future requests include token
        ↓
Token stored in Authorization header
```

---

## 🔄 Quy Trình Đăng Ký

```
User clicks Register button
        ↓
Navigate to /register
        ↓
User enters name, email, password
        ↓
Validate form data
        ↓
Send request to backend
        ↓
Backend validates email (unique?)
        ↓
Backend creates user account
        ↓
Backend returns success message
        ↓
Show success alert
        ↓
Redirect to /login
        ↓
User can now login
```

---

## 📱 Sử Dụng Từ Component

### Kiểm tra Trạng Thái Đăng Nhập
```typescript
import { useAuth } from '../contexts/AuthContext'

export default function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Vui lòng đăng nhập</div>
  }
  
  return (
    <div>
      <p>Xin chào {user?.name}</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  )
}
```

### Redirect Người Dùng
```typescript
import { useNavigate } from 'react-router-dom'

export default function MyComponent() {
  const navigate = useNavigate()
  
  const handleLogin = () => {
    navigate('/login')
  }
  
  return <button onClick={handleLogin}>Đăng nhập</button>
}
```

---

## ⚙️ Cấu Hình Backend

Các endpoint cần sẵn sàng:

### POST /api/auth/register
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A"
}

Response:
{
  "success": true,
  "message": "Đăng ký thành công"
}
```

### POST /api/auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "user@example.com",
  "userId": "123"
}
```

### POST /api/auth/forgot-password
```json
Request:
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Email hướng dẫn đã được gửi"
}
```

### POST /api/auth/reset-password
```json
Request:
{
  "resetCode": "abc123xyz",
  "newPassword": "newpassword123"
}

Response:
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công"
}
```

---

## 🧪 Kiểm Tra

### Test Login
1. Mở http://localhost:5173/login
2. Nhập email & password
3. Nhấn "Đăng Nhập"
4. Nếu thành công → Redirect đến /
5. Kiểm tra localStorage → Có token

### Test Register
1. Mở http://localhost:5173/register
2. Nhập thông tin
3. Nhấn "Đăng Ký"
4. Nếu thành công → Redirect đến /login
5. Đăng nhập với tài khoản vừa tạo

### Test Protected Route
1. Đăng xuất
2. Cố gắng truy cập /chat
3. Nên redirect đến /login

### Test Token
1. Mở DevTools (F12)
2. Vào Console
3. Chạy: `localStorage.getItem('authToken')`
4. Nên thấy JWT token

---

## 🐛 Troubleshooting

### Lỗi "CORS error" khi đăng nhập
**Giải pháp:** Đảm bảo backend CORS config đúng
```java
// Backend CorsConfig.java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173"  // Thêm dòng này
));
```

### Lỗi "Email already exists"
**Giải pháp:** Email đã được đăng ký
- Sử dụng email khác
- Hoặc reset database

### Token hết hạn ngay sau login
**Giải pháp:** Kiểm tra JWT_SECRET
```bash
# Backend .env
JWT_SECRET=my-secret-key-min-32-characters
```

### Logout không hoạt động
**Giải pháp:** Kiểm tra localStorage bị xóa
```javascript
localStorage.clear()
```

---

## 📚 File Liên Quan

- `src/pages/Login.tsx` - Trang đăng nhập
- `src/pages/Register.tsx` - Trang đăng ký
- `src/pages/ForgotPassword.tsx` - Quên mật khẩu
- `src/pages/ResetPassword.tsx` - Đặt lại mật khẩu
- `src/pages/Profile.tsx` - Thông tin cá nhân
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/components/ProtectedRoute.tsx` - Bảo vệ tuyến đường
- `src/services/api.ts` - API client (authApi)
- `src/App.tsx` - Routes config

---

## ✅ Checklist Triển Khai

- [ ] Backend login endpoint đã sẵn sàng
- [ ] Backend register endpoint đã sẵn sàng
- [ ] Backend forgot-password endpoint đã sẵn sàng
- [ ] Backend reset-password endpoint đã sẵn sàng
- [ ] CORS config cho phép frontend origin
- [ ] JWT secret đã cấu hình
- [ ] Database email validation
- [ ] Email service để gửi reset link
- [ ] Test tất cả flows

---

## 🚀 Next Steps

1. ✅ Hoàn thiện tích hợp Backend
2. ✅ Kiểm tra tất cả endpoints
3. [ ] Thêm Social Login (Google, Facebook)
4. [ ] Thêm Two-Factor Authentication
5. [ ] Thêm Email Verification
6. [ ] Thêm User Profile Editing
7. [ ] Thêm Password Change Form
8. [ ] Thêm Account Deletion

---

**Happy Coding!** 🎉
