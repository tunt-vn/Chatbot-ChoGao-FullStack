# 🚀 Quick Start Guide - Kết nối Backend & Frontend

## ⚡ Bước 1: Chuẩn bị môi trường (2-3 phút)

### 1.1 Cài đặt dependencies Frontend
```bash
cd chatbot-ChoGao
npm install
```

### 1.2 Tạo file `.env` cho Backend
```bash
cd ../Chatbot-ChoGao-BE
cp .env.example .env
```

**Chỉnh sửa file `.env` với các giá trị thực:**
```properties
DB_URL=jdbc:postgresql://localhost:5432/chatbot_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret

JWT_SECRET=your_secret_key_min_32_chars

N8N_WEBHOOK_URL=http://localhost:5678/webhook/chatbot

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

### 1.3 Tạo file `.env.local` cho Frontend
```bash
cd ../chatbot-ChoGao
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:8080/api
EOF
```

## ▶️ Bước 2: Chạy ứng dụng (Đơn giản hóa)

### Terminal 1 - Backend
```bash
cd Chatbot-ChoGao-BE
mvn clean install
mvn spring-boot:run
```
✅ Backend chạy trên: `http://localhost:8080`

### Terminal 2 - Frontend  
```bash
cd chatbot-ChoGao
npm run dev
```
✅ Frontend chạy trên: `http://localhost:5173`

## ✅ Bước 3: Kiểm tra kết nối

### Test 1: Mở browser
```
http://localhost:5173
```

### Test 2: Kiểm tra chat
- Mở trang chat
- Nhập tin nhắn
- Nếu không lỗi CORS → Kết nối OK ✅

### Test 3: Kiểm tra console
- Mở DevTools (F12)
- Vào tab Network
- Gửi tin nhắn
- Kiểm tra request đến `http://localhost:8080/api/chat`

## 🔧 Các file quan trọng đã được tạo/cập nhật

### Frontend:
1. **`src/services/api.ts`** - API client (QUAN TRỌNG)
   - Centralized API calls
   - Token management
   - Error handling

2. **`src/contexts/AuthContext.tsx`** - Authentication context
   - User state management
   - Login/logout/register

3. **`src/hooks/useApi.ts`** - Reusable hooks
   - useApi: Generic API calls
   - useForm: Form handling

4. **`src/components/ChatWindow.tsx`** - Updated component
   - Integration với backend
   - Real-time chat

5. **`.env.local`** - Environment config (LOCAL)
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

6. **`.env.production`** - Environment config (PRODUCTION)
   ```
   VITE_API_BASE_URL=https://your-api-domain.com/api
   ```

### Backend:
1. **`src/config/CorsConfig.java`** - CORS configuration (MỚI)
   - Cho phép frontend truy cập
   - Cấu hình origins, methods, headers

2. **`src/config/SecurityConfig.java`** - Updated
   - Thêm CORS vào security chain
   - JWT authentication

3. **`.env.example`** - Environment template
   - Tất cả các biến cần thiết

## 📊 Flow kết nối

```
Frontend (React/Vite)
    ↓ (HTTP Request + JWT Token)
API Client (src/services/api.ts)
    ↓ (POST /api/chat)
Backend Spring Boot
    ↓ (Verify JWT + Process)
Chat Service
    ↓ (N8N Webhook)
AI Response
    ↓
Frontend (Display Message)
```

## 🔐 Authentication Flow

```
1. User enters email & password
   ↓
2. POST /api/auth/login
   ↓
3. Server returns JWT token
   ↓
4. Frontend saves token to localStorage
   ↓
5. All future requests include:
   Authorization: Bearer {token}
   ↓
6. Server validates token
   ↓
7. Process request or return 401
```

## ⚠️ Common Issues & Solutions

### ❌ CORS Error
```
Access to XMLHttpRequest at 'http://localhost:8080/api/chat' 
has been blocked by CORS policy
```
**Solution:**
- Backend chạy chưa? → Chạy `mvn spring-boot:run`
- `.env.local` đúng URL? → Kiểm tra `VITE_API_BASE_URL`

### ❌ 401 Unauthorized
```
Response status: 401
```
**Solution:**
- Chưa login? → Cần thêm login page
- Token hết hạn? → Logout & login lại
- JWT_SECRET không đúng? → Kiểm tra `.env`

### ❌ 404 Not Found
```
Response status: 404
```
**Solution:**
- Endpoint không tồn tại? → Kiểm tra `SecurityConfig.java`
- Typo trong URL? → Kiểm tra `src/services/api.ts`

### ❌ Database Connection Error
```
Could not connect to database
```
**Solution:**
- PostgreSQL chạy chưa?
- Credentials đúng trong `.env`?
- URL đúng: `jdbc:postgresql://localhost:5432/chatbot_db`?

## 📚 Backend API Endpoints

### Public (không cần token)
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Private (cần token)
- `POST /api/chat` - Gửi tin nhắn
- `GET /api/chat/history` - Lịch sử chat
- `GET /api/user/profile` - Lấy profile
- `PUT /api/user/profile` - Cập nhật profile

## 🎯 Next Steps

### Phase 1 - Essential (tuần 1)
- [ ] Test API endpoints với Postman
- [ ] Tạo Login/Register page
- [ ] Tạo Protected Routes
- [ ] Thêm error handling

### Phase 2 - Enhancement (tuần 2)
- [ ] Add Loading skeleton
- [ ] Add Error boundary
- [ ] Add unit tests
- [ ] Add validation

### Phase 3 - Deployment (tuần 3)
- [ ] Set up CI/CD
- [ ] Deploy backend (Cloud)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Configure production domain

## 🆘 Cần giúp?

1. **Kiểm tra backend logs:**
   ```
   Xem console output của `mvn spring-boot:run`
   ```

2. **Kiểm tra frontend logs:**
   ```
   Mở DevTools (F12) → Console tab
   ```

3. **Kiểm tra network:**
   ```
   DevTools → Network tab → Gửi request
   ```

4. **Test API trực tiếp:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

## ✨ Summary

Bạn vừa kết nối Frontend & Backend thành công! 🎉

Các file chính:
- Frontend API: `src/services/api.ts`
- Backend CORS: `src/config/CorsConfig.java`
- Auth Context: `src/contexts/AuthContext.tsx`
- Chat Component: `src/components/ChatWindow.tsx`

Bây giờ bạn có thể:
✅ Gửi tin nhắn từ frontend đến backend
✅ Quản lý token JWT
✅ Handle authentication
✅ Display real-time responses

Happy coding! 🚀
