# Hướng Dẫn Tích Hợp Multi-Agent với Google ADK

## Tổng Quan
Dự án đã được tích hợp Multi-Agent (Google ADK) để thay thế hệ thống N8N cũ. Multi-Agent bao gồm:
- **Root Agent**: Điều phối chính, xử lý phân loại câu hỏi
- **Timetable Agent**: Xử lý câu hỏi về thời khóa biểu (Firebase Firestore)
- **RAG Agent**: Xử lý câu hỏi về thông tin trường, tuyển sinh (File Search)
- **Cyber Security**: Kiến thức về an toàn mạng (tích hợp sẵn trong Root Agent)

## Kiến Trúc Luồng Dữ Liệu

```
Frontend (React)
    ↓
Backend (Spring Boot) - ChatController
    ↓
ChatService
    ↓
MultiAgentService → REST API → FastAPI (custom_api.py)
    ↓
Google ADK Runner → Root Agent
    ↓
    ├─→ Timetable Tool (Firebase)
    ├─→ School Info Tool (RAG/File Search)
    └─→ Direct Response (Cyber Security)
```

## Cấu Trúc File Đã Thay Đổi

### Backend (Spring Boot)
```
Chatbot-ChoGao-BE/
├── src/main/java/com/tuatua/
│   ├── dto/
│   │   ├── MultiAgentRequest.java      [MỚI]
│   │   ├── MultiAgentResponse.java     [MỚI]
│   │   └── N8nRequest.java            [CŨ - có thể xóa]
│   ├── service/
│   │   ├── MultiAgentService.java     [MỚI]
│   │   └── ChatService.java           [ĐÃ CẬP NHẬT]
│   └── controller/
│       └── ChatController.java         [KHÔNG THAY ĐỔI]
├── src/main/resources/
│   └── application.properties         [ĐÃ CẬP NHẬT]
└── .env.example                       [ĐÃ CẬP NHẬT]
```

### Multi-Agent (Python)
```
multi_agent_chogao/
├── custom_api.py                      [FastAPI Server]
├── multi_agent/
│   ├── __init__.py
│   ├── agent.py                       [Root Agent]
│   ├── requirements.txt
│   └── sub_agent/
│       ├── ai_agent_timetable/        [Timetable Agent + Firebase]
│       │   ├── timetable_agent/
│       │   ├── firebase_config.py
│       │   └── serviceAccountKey.json [CẦN CẤU HÌNH]
│       └── RAG_agent/                 [RAG Agent]
│           └── rag_agent/
│               ├── agent.py
│               └── docs/              [Tài liệu tuyển sinh]
```

## Các Bước Triển Khai

### 1. Cấu Hình Backend (Spring Boot)

#### Bước 1.1: Cập nhật file `.env`
```bash
# Tạo file .env từ template (nếu chưa có)
cp .env.example .env
```

Thêm/cập nhật trong file `.env`:
```properties
# Multi-Agent API URL
MULTIAGENT_API_URL=http://127.0.0.1:8000

# XÓA hoặc comment dòng N8N cũ
# N8N_WEBHOOK_URL=...
```

#### Bước 1.2: Build Backend
```bash
cd Chatbot-ChoGao-BE
mvn clean install
```

### 2. Cấu Hình Multi-Agent (Python)

#### Bước 2.1: Cài đặt Dependencies
```bash
cd ../../multi_agent_chogao
pip install -r multi_agent/requirements.txt
```

#### Bước 2.2: Cấu hình Google API Key
Tạo file `multi_agent/.env`:
```bash
GOOGLE_GENAI_API_KEY=your_google_api_key_here
```

Hoặc set biến môi trường (PowerShell):
```powershell
$env:GOOGLE_GENAI_API_KEY='your_google_api_key_here'
```

#### Bước 2.3: Cấu hình Firebase (cho Timetable Agent)
1. Tải `serviceAccountKey.json` từ Firebase Console
2. Đặt file vào: `multi_agent/sub_agent/ai_agent_timetable/serviceAccountKey.json`

Hoặc set biến môi trường:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS='D:\path\to\serviceAccountKey.json'
```

#### Bước 2.4: Seed dữ liệu Firestore (nếu cần)
```bash
cd multi_agent/sub_agent/ai_agent_timetable
python seed_firestore.py
```

### 3. Khởi Động Hệ Thống

#### Bước 3.1: Khởi động Multi-Agent API
```bash
cd multi_agent_chogao
uvicorn custom_api:app --reload --host 127.0.0.1 --port 8000
```

Kiểm tra API:
```bash
curl http://127.0.0.1:8000/ping
# Expected: {"pong": true}
```

#### Bước 3.2: Khởi động Backend Spring Boot
```bash
cd Chatbot-ChoGao-BE
mvn spring-boot:run
```

Backend sẽ chạy trên `http://localhost:8080`

#### Bước 3.3: Khởi động Frontend (nếu cần)
```bash
cd Chatbot-ChoGao-FE
npm install
npm run dev
```

## Test API

### Test Multi-Agent API trực tiếp
```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "10a1 thứ hai học gì vậy?",
    "user_id": "phu_huynh_01",
    "session_id": "sess_01"
  }'
```

### Test qua Backend Spring Boot
```bash
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "chatInput": "10a1 thứ hai học gì vậy?"
  }'
```

## Troubleshooting

### Lỗi: "GOOGLE_GENAI_API_KEY not found"
**Giải pháp**: 
```powershell
$env:GOOGLE_GENAI_API_KEY='your_api_key'
# Hoặc tạo file multi_agent/.env
```

### Lỗi: "GOOGLE_APPLICATION_CREDENTIALS not found"
**Giải pháp**:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS='D:\path\to\serviceAccountKey.json'
```

### Lỗi kết nối: "Connection refused to 127.0.0.1:8000"
**Kiểm tra**:
1. Multi-Agent API có đang chạy không?
2. Port 8000 có bị chiếm không?
3. Firewall có block không?

### Backend không nhận được response
**Kiểm tra log**:
1. Spring Boot log: Xem `MultiAgentService` có gọi được API không
2. FastAPI log: Xem có nhận request không
3. Verify URL trong `.env`: `MULTIAGENT_API_URL=http://127.0.0.1:8000`

## So Sánh N8N vs Multi-Agent

| Tính năng | N8N (Cũ) | Multi-Agent (Mới) |
|-----------|----------|-------------------|
| **Workflow** | Visual workflow | Code-based agents |
| **AI Model** | Limited | Google Gemini 2.5 Pro |
| **Tools** | Webhook based | Native Python tools |
| **RAG** | Manual setup | Built-in File Search |
| **Firebase** | HTTP requests | Native SDK |
| **Debugging** | UI-based | Python logs |
| **Deployment** | Requires N8N server | FastAPI standalone |
| **Cost** | N8N hosting | API calls only |

## Các File Có Thể Xóa (sau khi test thành công)

```
Chatbot-ChoGao-BE/src/main/java/com/tuatua/dto/N8nRequest.java
```

Và xóa các config N8N trong `.env` (nếu có).

## Monitoring & Logs

### Backend Logs
```bash
# Xem log MultiAgentService
tail -f logs/spring-boot-logger.log | grep MultiAgentService
```

### Multi-Agent Logs
```bash
# FastAPI tự động in log ra console khi chạy với --reload
# [CHAT] >>> New request | user_id=... | session_id=...
# [CHAT] <<< Final answer: ...
```

## Production Deployment

### Multi-Agent API
Sử dụng Gunicorn thay vì uvicorn:
```bash
pip install gunicorn
gunicorn custom_api:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Backend Spring Boot
Build JAR và chạy:
```bash
mvn clean package -DskipTests
java -jar target/chatbot-backend-1.0.0.jar
```

### Environment Variables (Production)
```properties
MULTIAGENT_API_URL=http://your-fastapi-server:8000
GOOGLE_GENAI_API_KEY=your_production_api_key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

## Các Câu Hỏi Mẫu

### Timetable (Firebase)
- "10a1 thứ hai học gì vậy?"
- "Hôm nay em học môn gì?"
- "Thầy Nguyễn Văn A dạy lớp nào?"

### School Info (RAG)
- "Giới thiệu về trường"
- "Điều kiện tuyển sinh"
- "Học phí là bao nhiêu?"

### Cyber Security
- "Cách bảo vệ tài khoản Facebook"
- "Làm sao tránh lừa đảo online?"
- "An toàn khi sử dụng mạng xã hội"

## Liên Hệ & Support

Nếu gặp vấn đề, kiểm tra:
1. Log của Multi-Agent API
2. Log của Backend Spring Boot
3. Network connectivity giữa Backend <-> Multi-Agent
4. API keys và credentials

---

**Ngày cập nhật**: 2025-01-19
**Phiên bản**: 1.0.0
