# AI Agent TKB – THPT Chợ Gạo (Google ADK + Firebase)

Trợ lý AI trả lời câu hỏi về **thời khóa biểu** cho học sinh/phụ huynh trường **THPT Chợ Gạo**, sử dụng:
- **Google ADK** (agents, tools, runners)
- **Gemini (Google AI Studio)** để sinh câu trả lời
- **Firebase Firestore** để lưu TKB

---

## 1) Yêu cầu hệ thống

- Python **3.11+** (khuyến nghị 3.11–3.13)
- Tài khoản Firebase + **Service Account JSON**
- API key **Google AI Studio (Gemini)**  
  *(Nếu dùng Vertex AI trên GCP thì không cần API key AI Studio, nhưng cần `project`/`location` và bật Vertex AI).*

---

## 2) Cấu trúc dự án

```
.
├─ main.py                 # Agent console app (ADK runner)
├─ seed_firestore.py       # Script import dữ liệu mẫu vào Firestore
├─ sample_tkb.json         # Dữ liệu mẫu (lớp/giáo viên)
├─ requirements.txt
└─ .env                    # Khóa & cấu hình (tự tạo, xem bên dưới)
```

---

## 3) Cài đặt

### 3.1. Tạo & kích hoạt virtualenv

**Windows (PowerShell)**
```powershell
python -m venv venv
.env\Scripts\Activate.ps1
```

**macOS/Linux (bash)**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3.2. Cài dependencies

```bash
pip install -r requirements.txt
```

`requirements.txt` (tham khảo):
```
firebase-admin==6.4.0
google-adk==1.18.0
python-dotenv==1.0.1
google-cloud-storage>=3.0.0
google-cloud-aiplatform>=1.125.0
```

---

## 4) Cấu hình `.env`

Tạo file `.env` cạnh `main.py`:

```dotenv
# 1) Firebase service account (đường dẫn tới file JSON)
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json

# 2) Gemini API key (AI Studio): https://aistudio.google.com/app/apikey
GOOGLE_GENAI_API_KEY=AIzaSy...your_key_here
```

> Có thể dùng đường dẫn tuyệt đối cho `GOOGLE_APPLICATION_CREDENTIALS` (ví dụ `D:\\secrets\\firebase\\cho-gao-service.json`).

---

## 5) Bật Firestore & API cần thiết

1. **Bật Cloud Firestore API** cho đúng Project ID (khớp `project_id` trong file service account):  
   https://console.developers.google.com/apis/api/firestore.googleapis.com
2. **Khởi tạo Firestore** trong Firebase Console:  
   *Build → Firestore Database → Create database → chọn region phù hợp.*
3. **IAM**: Service account dùng trong `serviceAccountKey.json` cần quyền đọc/ghi Firestore  
   (ví dụ `roles/datastore.user`).

---

## 6) Seed dữ liệu mẫu

Chỉnh `sample_tkb.json` nếu cần, sau đó chạy:

```bash
python seed_firestore.py
```

Log hiển thị `Seeded: ...` là OK.  
Schema mặc định:
- `timetables_by_class`: doc id `10A1_Thứ 2`, field `class_name`, `day`, `schedule`
- `timetables_by_teacher`: doc id `Nguyễn Văn A_Thứ 2`, field `teacher_name`, `day`, `teaching`

---

## 7) Chạy agent (console)

```bash
python main.py
```

Ví dụ câu hỏi:
- `lớp 10a1 thứ 2 học gì?`
- `thầy Nguyễn Văn A dạy lớp nào hôm nay?`
- `lớp 10A1 thứ ba học môn nào, phòng nào?`

### Lưu ý xử lý nhập liệu
- Agent đã **chuẩn hoá ngày**: nhận `t2/thu 2/Thứ hai/Monday/Mon/hôm nay/ngày mai/2...` → map về `Thứ 2..7/Chủ nhật`.
- Agent **chuẩn hoá tên lớp** (ví dụ `10a1` → `10A1`).
- Nếu không tìm thấy TKB, agent sẽ gợi ý các **ngày có sẵn** theo dữ liệu thực tế trong Firestore.

---

## 8) Thiết kế dữ liệu (gợi ý)

### Theo lớp
**Collection**: `timetables_by_class`  
**Document id**: `{CLASS}_{DAY}` – ví dụ `10A1_Thứ 2`  
**Fields**:
```json
{
  "class_name": "10A1",
  "day": "Thứ 2",
  "schedule": [
    {"tiết": 1, "môn": "Toán", "phòng": "A101", "gv": "Nguyễn Văn A"},
    {"tiết": 2, "môn": "Văn",  "phòng": "A102", "gv": "Trần Thị B"}
  ]
}
```

### Theo giáo viên
**Collection**: `timetables_by_teacher`  
**Document id**: `{TEACHER}_{DAY}` – ví dụ `Nguyễn Văn A_Thứ 2`  
**Fields**:
```json
{
  "teacher_name": "Nguyễn Văn A",
  "day": "Thứ 2",
  "teaching": [
    {"tiết": 1, "lớp": "10A1", "môn": "Toán", "phòng": "A101"},
    {"tiết": 4, "lớp": "11A3", "môn": "Toán", "phòng": "B201"}
  ]
}
```

> Agent sẽ thử **2 chiến lược đọc**:  
> (1) Đọc document theo id ghép `{CLASS}_{DAY}` hoặc `{TEACHER}_{DAY}`  
> (2) Truy vấn theo field (`class_name/teacher_name` + `day`)

---

## 9) Troubleshooting

- **`FileNotFoundError: serviceAccountKey.json`**  
  `.env` thiếu `GOOGLE_APPLICATION_CREDENTIALS` hoặc đường dẫn sai.  
  Kiểm tra nhanh:
  ```bash
  python -c "import os; print(os.getenv('GOOGLE_APPLICATION_CREDENTIALS'))"
  ```

- **`Missing key inputs argument! ... provide (api_key)`**  
  Thiếu API key Gemini → thêm `GOOGLE_GENAI_API_KEY` vào `.env`.  
  Dự án đã “ép” set biến môi trường trước khi tạo Agent để ADK/SDK nhận key.

- **`403 SERVICE_DISABLED: Cloud Firestore API has not been used...`**  
  Chưa bật **Firestore API** hoặc chưa khởi tạo Firestore trong Firebase Console.

- **`'LlmAgent' object has no attribute 'run'`**  
  ADK mới không dùng `agent.run(...)`. Dự án đã dùng **`InMemoryRunner`** + `run_async(...)`.

- **Tool parse lỗi kiểu `str | None`**  
  Đã fix bằng chữ ký `day: str = ""` (tránh Union phức tạp).

- **“Không tìm thấy TKB …”**  
  Kiểm tra đúng **doc id**, **field name** (`schedule/teaching`), **viết hoa lớp**, **ngày chuẩn hoá**.  
  Có thể seed lại `sample_tkb.json`.

---

## 10) Dùng Vertex AI (tuỳ chọn)

Muốn gọi model qua **Vertex AI** (không dùng AI Studio API key):

1. Xoá `GOOGLE_GENAI_API_KEY` trong `.env`.
2. Đảm bảo service account có quyền Vertex AI.
3. Sửa `root_agent` trong `main.py`:
   ```python
   root_agent = Agent(
       name="timetable_agent",
       model="gemini-1.5-pro",
       tools=tools,
       vertexai=True,
       project="your-gcp-project-id",
       location="us-central1",
   )
   ```

---

## 11) Lộ trình mở rộng

- Kết nối giao diện web (FastAPI/Streamlit/Gradio) → deploy Cloud Run
- Thêm tool: “môn đang học bây giờ”, “lịch tuần”, “tiết trống/giờ trống lớp/giáo viên”
- Thêm xác thực/giới hạn quyền truy cập dữ liệu theo nhóm (học sinh/giáo viên)

---

## 12) License

MIT (tuỳ chỉnh theo nhu cầu dự án)
