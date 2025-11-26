# 🔗 Hướng Dẫn Kết Nối Backend - Frontend

## ✅ Đã Hoàn Tất

### Backend Configuration
- ✅ File `.env` đã được tạo với thông tin database, OAuth2, JWT
- ✅ CORS đã được cấu hình cho `http://localhost:5173` (Vite dev server)
- ✅ Multi-Agent API URL: `http://127.0.0.1:8000`
- ✅ ChatController trả về format chuẩn cho Frontend

### Frontend Configuration
- ✅ File `.env` đã được tạo với API base URL: `http://localhost:8080/api`
- ✅ API service đã sẵn sàng kết nối với Backend

---

## 🚀 Khởi Động Hệ Thống Đầy Đủ

### Bước 1: Khởi động Multi-Agent API
```powershell
cd d:\TuaTua\Code\code-project\chatbot-thpt-ChoGao\multi_agent_chogao
uvicorn custom_api:app --reload --host 127.0.0.1 --port 8000
```

**Kiểm tra:**
```powershell
curl http://127.0.0.1:8000/ping
# Expected: {"pong":true}
```

### Bước 2: Khởi động Backend Spring Boot
```powershell
cd d:\TuaTua\Code\code-project\chatbot-thpt-ChoGao\Chatbot-ChoGao-FullStack\Chatbot-ChoGao-BE
mvn spring-boot:run
```

**Backend sẽ chạy trên:** `http://localhost:8080`

**Kiểm tra:**
- Database connection
- Multi-Agent API connection
- CORS configuration

### Bước 3: Khởi động Frontend React
```powershell
cd d:\TuaTua\Code\code-project\chatbot-thpt-ChoGao\Chatbot-ChoGao-FullStack\Chatbot-ChoGao-FE
npm install
npm run dev
```

**Frontend sẽ chạy trên:** `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication (không cần JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |
| POST | `/api/auth/resend-verify-mail` | Gửi lại email xác thực |

### Chat (cần JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Gửi tin nhắn đến bot |
| GET | `/api/chat/history` | Lấy lịch sử chat |

### User (cần JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Lấy thông tin profile |
| PUT | `/api/user/profile` | Cập nhật profile |

---

## 🔐 Authentication Flow

### 1. Đăng nhập
```typescript
// Frontend call
const response = await authApi.login('user@example.com', 'password123');
// Response: { token: "eyJhbG...", user: {...} }
// Token được lưu tự động vào localStorage
```

### 2. Gọi API có authentication
```typescript
// Frontend tự động thêm header:
// Authorization: Bearer <token>
const response = await chatApi.sendMessage('Xin chào!');
```

### 3. Token hết hạn
- Backend trả về `401 Unauthorized`
- Frontend tự động redirect về `/login`
- User đăng nhập lại

---

## 💬 Chat API Format

### Request (Frontend → Backend)
```json
POST /api/chat
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
Body: {
  "chatInput": "10a1 thứ hai học gì vậy?"
}
```

### Response (Backend → Frontend)
```json
{
  "response": "Dạ, em gửi anh/chị thời khóa biểu của lớp 10A1 vào ngày thứ hai...",
  "timestamp": "2025-01-19T14:30:00",
  "sessionId": "user-session-user@example.com"
}
```

---

## 🧪 Test Flow Đầy Đủ

### Test 1: Health Check
```powershell
# Multi-Agent API
curl http://127.0.0.1:8000/ping

# Backend
curl http://localhost:8080/actuator/health
```

### Test 2: Đăng ký User
```powershell
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\"}'
```

### Test 3: Đăng nhập
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"test123\"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User",
    "role": "USER"
  }
}
```

### Test 4: Chat với Bot
```powershell
# Lưu token từ bước 3
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:8080/api/chat `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{\"chatInput\":\"10a1 thứ hai học gì vậy?\"}'
```

**Response:**
```json
{
  "response": "Dạ, em gửi anh/chị thời khóa biểu của lớp 10A1 vào ngày thứ hai:\n\n**Tiết 1:** Môn Toán...",
  "timestamp": "2025-01-19T14:30:00",
  "sessionId": "user-session-test@example.com"
}
```

---

## 🔍 Debug & Troubleshooting

### Frontend không kết nối được Backend

**Kiểm tra:**
1. Backend có đang chạy không? `http://localhost:8080`
2. File `.env` có đúng URL không?
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
3. CORS có được cấu hình đúng không? Check console browser

**Fix CORS nếu cần:**
```java
// CorsConfig.java - Thêm origin
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "http://127.0.0.1:5173"
));
```

### Backend không kết nối được Multi-Agent

**Kiểm tra:**
1. Multi-Agent API có chạy không? `http://127.0.0.1:8000/ping`
2. File `.env` backend có đúng URL không?
   ```
   MULTIAGENT_API_URL=http://127.0.0.1:8000
   ```
3. Check log Backend để xem lỗi kết nối

### Token expired (401 Unauthorized)

**Frontend tự động xử lý:**
- Xóa token khỏi localStorage
- Redirect về `/login`
- User đăng nhập lại

**Backend:**
- JWT expiration: 15 phút (`JWT_EXPIRATION_MS=900000`)
- Refresh token: 7 ngày (`JWT_REFRESH_EXPIRATION_MS=604800000`)

### Chat không có response

**Kiểm tra:**
1. Multi-Agent API có hoạt động không?
2. Firebase credentials có đúng không?
3. Google API Key có hợp lệ không?
4. Check log của cả 3 layer: Frontend → Backend → Multi-Agent

---

## 📊 Luồng Dữ Liệu Đầy Đủ

```
User nhập tin nhắn trong Frontend
    ↓
ChatWindow.tsx gọi chatApi.sendMessage()
    ↓
    [HTTP POST /api/chat]
    [Header: Authorization: Bearer <token>]
    [Body: {"chatInput": "..."}]
    ↓
Backend: ChatController.chatWithBot()
    ↓
ChatService.processUserMessage()
    ├─ Lưu tin nhắn user vào DB
    ├─ Gọi MultiAgentService.sendMessageToMultiAgent()
    │   ↓
    │   [HTTP POST http://127.0.0.1:8000/chat]
    │   [Body: {"message": "...", "user_id": "...", "session_id": "..."}]
    │   ↓
    │   Multi-Agent API (FastAPI)
    │   ↓
    │   Google ADK Runner → Root Agent
    │   ↓
    │   ├─ Timetable Tool (Firebase)
    │   ├─ School Info Tool (RAG)
    │   └─ Direct Response (Cyber Security)
    │   ↓
    │   [Response: {"answer": "...", "user_id": "...", "session_id": "..."}]
    │   ↓
    ├─ Nhận response từ Multi-Agent
    └─ Lưu response vào DB
    ↓
Trả về ChatResponse cho Frontend
    ↓
ChatWindow hiển thị tin nhắn cho User
```

---

## 🎯 Các File Quan Trọng

### Backend
- **`.env`** - Cấu hình database, OAuth2, JWT, Multi-Agent URL
- **`ChatController.java`** - REST endpoints cho chat
- **`ChatService.java`** - Business logic
- **`MultiAgentService.java`** - Gọi Multi-Agent API
- **`CorsConfig.java`** - CORS configuration
- **`SecurityConfig.java`** - JWT & Authentication

### Frontend
- **`.env`** - API base URL
- **`api.ts`** - API client với authentication
- **`AuthContext.tsx`** - Auth state management
- **`ChatWindow.tsx`** - Chat UI component

---

## 🔐 Environment Variables

### Backend `.env`
```properties
# Database
DB_URL=jdbc:postgresql://...
DB_USERNAME=postgres.pykvpkiknqdezrgbjdqq
DB_PASSWORD=khoi2512

# OAuth2
GOOGLE_CLIENT_ID=891697014995-...
GOOGLE_CLIENT_SECRET=GOCSPX-...

# JWT
JWT_SECRET=aS1kPjQsaDBsZ2prZGZq...
JWT_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

# Multi-Agent
MULTIAGENT_API_URL=http://127.0.0.1:8000

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=khoiminhnguyen2k4@gmail.com
MAIL_PASSWORD=xfht dhsi jxfr mvrr
```

### Frontend `.env`
```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

### Multi-Agent `.env`
```bash
GOOGLE_GENAI_API_KEY=your_google_api_key
```

---

## ✅ Checklist Triển Khai

- [x] Backend `.env` đã được tạo
- [x] Frontend `.env` đã được tạo
- [x] CORS đã được cấu hình
- [x] ChatController format response chuẩn
- [x] Multi-Agent API configuration
- [ ] Test đăng ký user
- [ ] Test đăng nhập
- [ ] Test chat với bot
- [ ] Test lịch sử chat
- [ ] Test các loại câu hỏi (Timetable, School Info, Cyber Security)

---

## 🚦 Thứ Tự Khởi Động

1. **Multi-Agent API** (Port 8000) - Bắt buộc
2. **Backend Spring Boot** (Port 8080) - Bắt buộc
3. **Frontend React** (Port 5173) - Bắt buộc

**Lệnh nhanh:**
```powershell
# Sử dụng script tự động
.\start-system.ps1
```

---

**Kết nối BE-FE đã sẵn sàng!** 🎉

Bạn có thể bắt đầu test hệ thống đầy đủ ngay bây giờ.
