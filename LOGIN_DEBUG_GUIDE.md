# 🐛 Hướng Dẫn Debug Login Issue

## 🔍 Vấn Đề Đã Phát Hiện

Backend đang trả về **TokenResponse** thay vì **LoginResponse**, khiến frontend không parse được user info.

### Backend Response (SAI)
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "550e8400...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

### Frontend Expect (ĐÚNG)
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  }
}
```

## ✅ Đã Sửa

**File**: `AuthController.java`

**Trước:**
```java
TokenResponse tokenResponse = new TokenResponse(jwt, refreshToken.getToken(), jwtExpirationMs / 1000);
return ResponseEntity.ok(tokenResponse);
```

**Sau:**
```java
LoginResponse loginResponse = new LoginResponse(jwt, user);
return ResponseEntity.ok(loginResponse);
```

## 🧪 Cách Test

### 1. Kiểm Tra Backend Response

Mở browser DevTools (F12) → Network tab → Thử login:

**Request:**
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "your@email.com",
    "name": "Your Name",
    "role": "MEMBER",
    "enabled": true,
    "provider": "LOCAL"
  }
}
```

### 2. Kiểm Tra Console Errors

Mở Console tab (F12) và xem có lỗi gì:

**Lỗi thường gặp:**

#### a. CORS Error
```
Access to fetch at 'http://localhost:8080/api/auth/login' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Giải pháp**: Kiểm tra `CorsConfig.java` có allow origin `http://localhost:5173`

#### b. 401 Unauthorized
```
API Error: 401 - Tài khoản không tồn tại hoặc chưa được xác thực.
```

**Nguyên nhân**: 
- Tài khoản chưa verify email
- Email/password sai

**Giải pháp**: 
1. Kiểm tra email để verify
2. Hoặc verify trực tiếp trong database:
```sql
UPDATE users SET enabled = true WHERE email = 'your@email.com';
```

#### c. Network Error
```
TypeError: Failed to fetch
```

**Nguyên nhân**: Backend chưa chạy hoặc sai URL

**Giải pháp**: 
- Kiểm tra backend đang chạy: `http://localhost:8080`
- Kiểm tra `.env.local`: `VITE_API_BASE_URL=http://localhost:8080/api`

#### d. Parse Error
```
Unexpected token < in JSON at position 0
```

**Nguyên nhân**: Backend trả về HTML thay vì JSON (thường là error page)

**Giải pháp**: Xem backend logs để tìm lỗi

### 3. Kiểm Tra Backend Logs

```bash
# Xem logs trong terminal đang chạy backend
# Tìm dòng có "ERROR" hoặc "Exception"
```

**Lỗi thường gặp:**

#### a. Authentication Failed
```
org.springframework.security.authentication.BadCredentialsException: Bad credentials
```
→ Mật khẩu sai

#### b. User Not Found
```
java.util.NoSuchElementException: No value present
```
→ Email không tồn tại

#### c. User Not Enabled
```
Tài khoản không tồn tại hoặc chưa được xác thực.
```
→ Tài khoản chưa verify

### 4. Test với cURL

```bash
# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}' \
  -v

# Kiểm tra response
# Nếu thành công, sẽ thấy:
# HTTP/1.1 200
# Content-Type: application/json
# {"token":"...","user":{...}}
```

### 5. Test với Postman

1. Tạo request mới:
   - Method: POST
   - URL: `http://localhost:8080/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "email": "your@email.com",
     "password": "yourpassword"
   }
   ```

2. Click Send

3. Kiểm tra response:
   - Status: 200 OK
   - Body có `token` và `user`

## 🔧 Các Bước Khắc Phục

### Bước 1: Verify Email

Nếu tài khoản chưa verify:

**Option A: Verify qua email**
1. Kiểm tra email inbox
2. Click link verify
3. Thử login lại

**Option B: Verify trực tiếp database**
```sql
-- Xem user
SELECT id, email, name, enabled FROM users WHERE email = 'your@email.com';

-- Enable user
UPDATE users SET enabled = true WHERE email = 'your@email.com';
```

### Bước 2: Reset Password (nếu quên)

```sql
-- Tạo password mới (BCrypt hash của "password123")
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' 
WHERE email = 'your@email.com';
```

### Bước 3: Kiểm Tra CORS

**File**: `CorsConfig.java`

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173") // ✅ Frontend URL
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
}
```

### Bước 4: Restart Backend

```bash
# Stop backend (Ctrl+C)
# Start lại
cd Chatbot-ChoGao-BE
mvn spring-boot:run
```

### Bước 5: Clear Browser Cache

1. Mở DevTools (F12)
2. Right-click Refresh button
3. Chọn "Empty Cache and Hard Reload"
4. Hoặc: Clear localStorage
```javascript
// Trong Console
localStorage.clear()
```

## 📊 Checklist Debug

- [ ] Backend đang chạy (`http://localhost:8080`)
- [ ] Frontend đang chạy (`http://localhost:5173`)
- [ ] User đã verify email (enabled = true)
- [ ] Email/password đúng
- [ ] CORS configured đúng
- [ ] Network tab không có lỗi
- [ ] Console không có lỗi
- [ ] Response format đúng (có token và user)

## 🎯 Test Account

Để test nhanh, tạo user test:

```sql
-- Tạo user test (password: "password123")
INSERT INTO users (email, name, password, enabled, role, provider) 
VALUES (
  'test@test.com',
  'Test User',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  true,
  'MEMBER',
  'LOCAL'
);
```

Sau đó login với:
- Email: `test@test.com`
- Password: `password123`

## 🚨 Lỗi Phổ Biến & Giải Pháp

### 1. "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu"

**Nguyên nhân**: 
- Response format không đúng
- Backend trả về error

**Giải pháp**:
1. Xem Network tab → Response
2. Xem Console → Error message
3. Xem backend logs

### 2. "Tài khoản chưa được xác thực"

**Nguyên nhân**: `enabled = false`

**Giải pháp**: Verify email hoặc update database

### 3. Redirect về /login ngay sau khi login

**Nguyên nhân**: 
- Token không được lưu
- User state không được set

**Giải pháp**:
1. Kiểm tra localStorage có `authToken` và `user`
2. Kiểm tra AuthContext có set user state
3. Xem Console có lỗi gì

### 4. User info không hiển thị trên header

**Nguyên nhân**: 
- User state null
- AuthContext không load user

**Giải pháp**:
1. Kiểm tra localStorage có `user`
2. Refresh page
3. Xem AuthContext useEffect có chạy

## 📝 Debug Checklist

Khi gặp lỗi login, làm theo thứ tự:

1. ✅ Mở DevTools (F12)
2. ✅ Vào Network tab
3. ✅ Thử login
4. ✅ Xem request `/api/auth/login`:
   - Status code?
   - Response body?
   - Headers?
5. ✅ Vào Console tab:
   - Có error gì?
   - Error message là gì?
6. ✅ Xem backend logs:
   - Có exception gì?
   - SQL queries có chạy?
7. ✅ Kiểm tra database:
   - User có tồn tại?
   - enabled = true?
8. ✅ Test với cURL/Postman
9. ✅ Nếu vẫn lỗi, gửi screenshot:
   - Network tab
   - Console tab
   - Backend logs

---

**Cập nhật**: November 14, 2025  
**Status**: Backend đã sửa, đang restart  
**Next**: Test login sau khi backend khởi động xong
