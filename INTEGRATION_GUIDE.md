# Hướng dẫn kết nối Backend và Frontend

## 📋 Tổng quan

Dự án này sử dụng kiến trúc client-server với:
- **Frontend**: React + TypeScript + Vite (chạy trên `http://localhost:5173`)
- **Backend**: Spring Boot 3.5.0 + Java 21 (chạy trên `http://localhost:8080`)

## 🚀 Chuẩn bị

### 1. Yêu cầu hệ thống
- **Node.js**: v18.0.0 hoặc cao hơn
- **Java JDK**: 21
- **Maven**: 3.8.0 hoặc cao hơn

### 2. Cài đặt dependencies

#### Frontend
```bash
cd chatbot-ChoGao
npm install
```

#### Backend
Backend sử dụng Maven, không cần cài đặt thêm nếu đã có JDK và Maven.

## 🔧 Cấu hình

### Backend Configuration

#### 1. File `.env` (Tạo file trong root của Chatbot-ChoGao-BE)
```properties
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/chatbot_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Configuration
JWT_SECRET=your_secret_key_here_min_32_chars

# N8N Webhook
N8N_WEBHOOK_URL=http://your-n8n-instance/webhook/chatbot

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

#### 2. Cấu hình CORS (Đã được thiết lập)
File `CorsConfig.java` đã được tạo để cho phép frontend truy cập backend:
- Cho phép origins: `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`
- Cho phép các HTTP methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Cho phép gửi credentials

### Frontend Configuration

#### 1. File `.env.local` (Đã tạo)
```
VITE_API_BASE_URL=http://localhost:8080/api
```

#### 2. File `.env.production` (Đã tạo)
```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## 📡 API Integration

### API Client (`src/services/api.ts`)
Đã tạo một centralized API client với:
- **authApi**: Đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu
- **chatApi**: Gửi tin nhắn, lấy lịch sử chat
- **userApi**: Lấy profile, cập nhật profile
- **Token management**: Lưu/lấy/xóa JWT token từ localStorage

### Cách sử dụng API

```typescript
// Trong component
import { chatApi, authApi } from '../services/api'

// Gửi tin nhắn
const response = await chatApi.sendMessage('Xin chào')

// Lấy lịch sử chat
const history = await chatApi.getChatHistory()

// Đăng nhập
const loginResponse = await authApi.login('email@example.com', 'password')

// Đăng xuất
authApi.logout()
```

### Authentication Flow

1. **Đăng nhập/Đăng ký**: API trả về JWT token
2. **Lưu token**: Token được lưu trong `localStorage` với key `authToken`
3. **Gửi requests**: Tất cả API requests (trừ login/register) tự động gửi token trong header `Authorization: Bearer {token}`
4. **Token hết hạn**: Nếu token hết hạn (401), tự động xóa token và redirect đến `/login`

## ▶️ Chạy ứng dụng

### Terminal 1 - Backend
```bash
cd Chatbot-ChoGao-BE

# Build project
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run

# Hoặc chạy từ JAR đã build
java -jar target/mobile-backend-0.1.0.jar
```

Backend sẽ chạy trên `http://localhost:8080`

### Terminal 2 - Frontend
```bash
cd chatbot-ChoGao

# Chạy development server
npm run dev
```

Frontend sẽ chạy trên `http://localhost:5173`

## 🧪 Kiểm tra kết nối

### 1. Kiểm tra CORS
Mở browser console và thử:
```javascript
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password'
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

### 2. Kiểm tra ChatWindow component
- Component `ChatWindow.tsx` đã được update để:
  - Load chat history khi mount
  - Gửi tin nhắn đến backend
  - Hiển thị loading state
  - Xử lý errors
  - Hiển thị timestamps

## 🔐 Security Notes

1. **Token Storage**: JWT tokens được lưu trong localStorage (có thể cải thiện bằng httpOnly cookies)
2. **CSRF Protection**: Backend đã disable CSRF cho `/api/**` vì sử dụng stateless JWT
3. **Password Security**: Mật khẩu được mã hóa bằng BCrypt trên backend
4. **HTTPS**: Trong production, luôn sử dụng HTTPS

## 📦 Backend Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/forgot-password` - Yêu cầu reset mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `POST /api/auth/resend-verify-mail` - Gửi lại email xác thực

### Chat (Yêu cầu authentication)
- `POST /api/chat` - Gửi tin nhắn
- `GET /api/chat/history` - Lấy lịch sử chat

### User (Yêu cầu authentication)
- `GET /api/user/profile` - Lấy profile người dùng
- `PUT /api/user/profile` - Cập nhật profile

## 🐛 Troubleshooting

### CORS Error
- Kiểm tra backend có chạy trên `http://localhost:8080`
- Kiểm tra file `.env.local` có URL đúng
- Kiểm tra `CorsConfig.java` có các origins đúng

### Token Error (401)
- Xóa localStorage hoặc logout
- Đăng nhập lại
- Kiểm tra JWT secret trong `.env`

### Database Connection Error
- Kiểm tra database service có chạy
- Kiểm tra credentials trong `.env`
- Kiểm tra URL trong `.env`

### Build Error
- Xóa `node_modules` và `package-lock.json`, chạy `npm install` lại
- Java version phải là 21

## 📚 Resources

- [Vite Documentation](https://vitejs.dev)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Material-UI Documentation](https://mui.com)
- [React Router Documentation](https://reactrouter.com)

## ✅ Next Steps

1. Thêm authentication pages (Login, Register)
2. Thêm Protected Routes
3. Thêm Error Boundary
4. Thêm Loading Skeleton
5. Thêm Unit Tests
6. Thêm E2E Tests
