# ⚡ Quick Fix - Login Issue

## 🐛 Vấn Đề
Đăng nhập thất bại mặc dù email/password đúng.

## ✅ Nguyên Nhân
Backend trả về **TokenResponse** thay vì **LoginResponse**.

## 🔧 Đã Sửa

**File**: `Chatbot-ChoGao-BE/src/main/java/com/tuatua/controller/AuthController.java`

```java
// TRƯỚC (SAI)
TokenResponse tokenResponse = new TokenResponse(jwt, refreshToken.getToken(), jwtExpirationMs / 1000);
return ResponseEntity.ok(tokenResponse);

// SAU (ĐÚNG)
LoginResponse loginResponse = new LoginResponse(jwt, user);
return ResponseEntity.ok(loginResponse);
```

## 🧪 Test Ngay

1. **Backend đã restart** ✅
2. **Thử login lại** với tài khoản đã verify

### Nếu Vẫn Lỗi

#### Kiểm tra 1: Tài khoản đã verify chưa?

```sql
-- Xem trong database
SELECT email, enabled FROM users WHERE email = 'your@email.com';

-- Nếu enabled = false, chạy:
UPDATE users SET enabled = true WHERE email = 'your@email.com';
```

#### Kiểm tra 2: Xem Network tab (F12)

1. Mở DevTools (F12)
2. Vào Network tab
3. Thử login
4. Click vào request `/api/auth/login`
5. Xem Response:

**Nếu thành công (200 OK):**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "your@email.com",
    "name": "Your Name",
    "role": "MEMBER"
  }
}
```

**Nếu lỗi 401:**
```
Tài khoản không tồn tại hoặc chưa được xác thực.
```
→ Verify email hoặc enable trong database

#### Kiểm tra 3: Console có lỗi gì?

Mở Console tab (F12) và xem error message.

## 🎯 Test Account

Nếu muốn test nhanh, tạo user test:

```sql
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

Login với:
- Email: `test@test.com`
- Password: `password123`

## 📞 Nếu Vẫn Không Được

Gửi cho tôi:
1. Screenshot Network tab (request + response)
2. Screenshot Console tab (errors)
3. Email bạn đang dùng để login

---

**Status**: ✅ Backend đã sửa và restart  
**Next**: Thử login lại
