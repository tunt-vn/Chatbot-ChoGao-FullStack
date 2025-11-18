# 🔒 Hướng Dẫn Triển Khai Các Tính Năng Bảo Mật

## 📋 Tổng Quan

Tài liệu này hướng dẫn chi tiết về các tính năng bảo mật đã được triển khai trong dự án Chatbot ChoGao.

---

## ✅ Các Tính Năng Đã Triển Khai

### 1. 🍪 HttpOnly Cookies cho Tokens

**Mô tả**: Tokens được lưu trong HttpOnly cookies thay vì localStorage để tăng cường bảo mật chống XSS attacks.

**Files liên quan**:
- `CookieUtil.java` - Utility class để quản lý cookies
- `AuthController.java` - Updated để sử dụng cookies

**Cách hoạt động**:
```java
// Khi login thành công
cookieUtil.addCookie(response, "accessToken", jwt, 900); // 15 phút
cookieUtil.addCookie(response, "refreshToken", refreshToken, 604800); // 7 ngày
```

**Lợi ích**:
- ✅ Bảo vệ khỏi XSS attacks
- ✅ Tự động gửi với mọi request
- ✅ Không thể truy cập từ JavaScript

**Cấu hình**:
```properties
# application.properties
cookie.domain=localhost
cookie.secure=false  # Set true trong production với HTTPS
```

---

### 2. 🔄 Refresh Token Mechanism

**Mô tả**: Hệ thống refresh token cho phép gia hạn access token mà không cần đăng nhập lại.

**Files liên quan**:
- `RefreshToken.java` - Entity
- `RefreshTokenService.java` - Business logic
- `RefreshTokenRepository.java` - Data access

**Cách hoạt động**:
```
1. User login → Nhận access token (15 phút) + refresh token (7 ngày)
2. Access token hết hạn → Frontend gọi /api/auth/refresh
3. Backend verify refresh token → Tạo access token mới
4. Refresh token hết hạn → User phải login lại
```

**API Endpoints**:

#### Login (nhận cả 2 tokens)
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

#### Logout (revoke refresh token)
```bash
POST /api/auth/logout
```

**Cấu hình**:
```properties
# application.properties
jwt.expiration=900000              # 15 phút
jwt.refresh.expiration=604800000   # 7 ngày
```

**Tính năng bổ sung**:
- ✅ Tự động cleanup tokens hết hạn (chạy lúc 2 AM hàng ngày)
- ✅ Revoke tất cả tokens của user khi logout
- ✅ Lưu IP address và User Agent để audit
- ✅ Kiểm tra token đã bị revoke

---

### 3. ⏱️ Rate Limiting

**Mô tả**: Giới hạn số lượng requests từ một IP address để chống DDoS và brute force attacks.

**Files liên quan**:
- `RateLimitingFilter.java` - Filter implementation
- `pom.xml` - Thêm dependency bucket4j

**Cách hoạt động**:
```
- Mỗi IP được phép 100 requests/phút
- Sử dụng Token Bucket algorithm
- Trả về HTTP 429 (Too Many Requests) khi vượt giới hạn
```

**Response khi vượt giới hạn**:
```json
HTTP 429 Too Many Requests
{
  "error": "Quá nhiều yêu cầu. Vui lòng thử lại sau."
}
```

**Cấu hình**:
```java
// RateLimitingFilter.java
private Bucket createNewBucket() {
    // 100 requests per minute
    Bandwidth limit = Bandwidth.classic(100, 
        Refill.intervally(100, Duration.ofMinutes(1)));
    return Bucket.builder().addLimit(limit).build();
}
```

**Tùy chỉnh**:
- Thay đổi số lượng requests: `100` → số bạn muốn
- Thay đổi thời gian: `Duration.ofMinutes(1)` → `Duration.ofSeconds(30)`

---

### 4. 📊 Audit Logging

**Mô tả**: Ghi lại tất cả các hành động quan trọng của người dùng để audit và security monitoring.

**Files liên quan**:
- `AuditLog.java` - Entity
- `AuditLogService.java` - Service
- `AuditLogRepository.java` - Repository

**Các hành động được log**:
- ✅ LOGIN - Đăng nhập
- ✅ LOGOUT - Đăng xuất
- ✅ REGISTER - Đăng ký tài khoản mới
- ✅ GOOGLE_LOGIN - Đăng nhập qua Google
- ✅ TOKEN_REFRESH - Refresh access token
- ✅ PASSWORD_RESET - Đặt lại mật khẩu
- ✅ FAILED_LOGIN - Đăng nhập thất bại

**Thông tin được lưu**:
```java
- User ID
- Action (LOGIN, LOGOUT, etc.)
- Details (mô tả chi tiết)
- Timestamp
- IP Address
- User Agent
- Endpoint
- HTTP Method
- Status Code
- Severity (INFO, WARNING, ERROR)
```

**Cách sử dụng**:
```java
// Trong controller
auditLogService.logAction(user, "LOGIN", "User logged in successfully", request);

// Log security event
auditLogService.logSecurityEvent(user, "FAILED_LOGIN", 
    "Invalid password attempt", "WARNING", request);
```

**Query logs**:
```java
// Lấy logs của user
Page<AuditLog> logs = auditLogRepository.findByUser(user, pageable);

// Lấy logs theo action
Page<AuditLog> loginLogs = auditLogRepository.findByAction("LOGIN", pageable);

// Lấy logs trong khoảng thời gian
List<AuditLog> logs = auditLogRepository.findByTimestampBetween(start, end);
```

**Indexes được tạo**:
- `idx_user_id` - Tìm kiếm theo user
- `idx_action` - Tìm kiếm theo action
- `idx_timestamp` - Tìm kiếm theo thời gian

---

### 5. 🔢 API Versioning

**Mô tả**: Hỗ trợ nhiều phiên bản API để duy trì backward compatibility.

**Files liên quan**:
- `controller/v1/AuthControllerV1.java`
- `controller/v1/ChatControllerV1.java`
- `ApiVersionConfig.java`

**Cấu trúc URL**:
```
/api/auth/login          → Non-versioned (current)
/api/v1/auth/login       → Version 1
/api/v2/auth/login       → Version 2 (future)
```

**Cách tạo version mới**:

1. Tạo package mới:
```
com.tuatua.controller.v2
```

2. Tạo controller mới:
```java
@RestController
@RequestMapping("/api/v2/auth")
public class AuthControllerV2 extends AuthController {
    // Override methods nếu cần thay đổi logic
    
    @Override
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(...) {
        // New implementation for v2
    }
}
```

3. Update SecurityConfig:
```java
.requestMatchers(antMatcher("/api/v2/auth/**")).permitAll()
```

**Best Practices**:
- ✅ Giữ non-versioned endpoints cho version hiện tại
- ✅ Tạo versioned endpoints khi có breaking changes
- ✅ Maintain ít nhất 2 versions cùng lúc
- ✅ Deprecate old versions sau 6-12 tháng

---

## 🚀 Cách Sử Dụng

### 1. Cập nhật Dependencies

```bash
cd Chatbot-ChoGao-BE
mvn clean install
```

### 2. Cập nhật Database

Các bảng mới sẽ được tự động tạo khi chạy application (JPA auto-create):
- `refresh_tokens`
- `audit_logs`

### 3. Cập nhật .env

```bash
cp .env.example .env
# Chỉnh sửa .env với các giá trị thực tế
```

Thêm các biến mới:
```properties
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
```

### 4. Chạy Application

```bash
mvn spring-boot:run
```

---

## 🧪 Testing

### Test Rate Limiting

```bash
# Gửi nhiều requests liên tiếp
for i in {1..150}; do
  curl http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' &
done

# Request thứ 101 sẽ nhận HTTP 429
```

### Test Refresh Token

```bash
# 1. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response: {"accessToken":"...", "refreshToken":"..."}

# 2. Đợi access token hết hạn (15 phút) hoặc test ngay

# 3. Refresh token
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"550e8400-e29b-41d4-a716-446655440000"}'

# Response: {"accessToken":"...", "refreshToken":"..."}
```

### Test Audit Logs

```sql
-- Xem tất cả logs
SELECT * FROM audit_logs ORDER BY timestamp DESC;

-- Xem logs của một user
SELECT * FROM audit_logs WHERE user_id = 1;

-- Xem login attempts
SELECT * FROM audit_logs WHERE action = 'LOGIN';

-- Xem failed logins
SELECT * FROM audit_logs WHERE action = 'FAILED_LOGIN';
```

### Test API Versioning

```bash
# Non-versioned
curl http://localhost:8080/api/auth/login

# Version 1
curl http://localhost:8080/api/v1/auth/login

# Cả 2 đều hoạt động giống nhau
```

---

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

### Metrics

```bash
curl http://localhost:8080/actuator/metrics
```

### Custom Metrics (Future)

Có thể thêm custom metrics cho:
- Số lượng login thành công/thất bại
- Số lượng refresh token được sử dụng
- Rate limit violations
- API response times

---

## 🔐 Security Best Practices

### Production Checklist

- [ ] Set `COOKIE_SECURE=true` (requires HTTPS)
- [ ] Use strong JWT_SECRET (minimum 64 characters)
- [ ] Enable HTTPS/TLS
- [ ] Set proper CORS origins
- [ ] Configure firewall rules
- [ ] Enable database encryption
- [ ] Set up log monitoring
- [ ] Configure backup strategy
- [ ] Implement API key authentication cho external services
- [ ] Add request signing cho sensitive operations

### Recommended Settings

```properties
# Production application.properties
jwt.expiration=900000              # 15 phút
jwt.refresh.expiration=604800000   # 7 ngày
cookie.domain=yourdomain.com
cookie.secure=true                 # HTTPS only
spring.jpa.hibernate.ddl-auto=validate  # Không auto-update schema
```

---

## 🔮 Tính Năng Tương Lai (Chưa Triển Khai)

### 1. Request Signing
- Sign requests với HMAC
- Verify signature trước khi xử lý

### 2. Field-Level Encryption
- Mã hóa sensitive fields trong database
- Decrypt khi cần thiết

### 3. API Key Authentication
- Cho external services
- Rate limiting per API key

### 4. Advanced Rate Limiting
- Different limits cho different endpoints
- User-based rate limiting
- Whitelist/blacklist IPs

### 5. Two-Factor Authentication (2FA)
- TOTP-based 2FA
- SMS-based 2FA

---

## 📚 Tài Liệu Tham Khảo

- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Bucket4j Documentation](https://bucket4j.com/)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)

---

## 🆘 Troubleshooting

### Lỗi: "Refresh token đã hết hạn"
**Giải pháp**: User cần đăng nhập lại. Tăng `JWT_REFRESH_EXPIRATION` nếu cần.

### Lỗi: "Too Many Requests"
**Giải pháp**: Đợi 1 phút hoặc tăng rate limit trong `RateLimitingFilter.java`.

### Cookies không được set
**Giải pháp**: 
- Kiểm tra CORS configuration
- Đảm bảo frontend gửi `credentials: 'include'`
- Kiểm tra `cookie.domain` setting

### Audit logs không được tạo
**Giải pháp**:
- Kiểm tra async configuration
- Xem logs để tìm exceptions
- Verify database connection

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs: `logs/spring.log`
2. Xem TROUBLESHOOTING.md
3. Tạo issue trên GitHub
4. Liên hệ team

---

**Ngày cập nhật**: November 14, 2025  
**Version**: 1.0.0  
**Trạng thái**: ✅ Production Ready
