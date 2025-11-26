import traceback
import uuid
import os
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel

# Ensure GOOGLE_APPLICATION_CREDENTIALS is set before importing Google SDKs.
# If the repo contains a service account JSON (common for local development),
# use it automatically so `uvicorn custom_api:app` works without extra env setup.
if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    candidate = Path(__file__).resolve().parent / "multi_agent" / "sub_agent" / "ai_agent_timetable" / "serviceAccountKey.json"
    if candidate.exists():
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(candidate)
        print(f"[INFO] Set GOOGLE_APPLICATION_CREDENTIALS={candidate}")
    else:
        raise RuntimeError(
            "Lỗi cấu hình: Thiếu GOOGLE_APPLICATION_CREDENTIALS.\n"
            "Cách khắc phục nhanh (PowerShell):\n"
            "  $env:GOOGLE_APPLICATION_CREDENTIALS='D:\\path\\to\\serviceAccountKey.json'\n"
            "Hoặc đặt file `serviceAccountKey.json` vào `multi_agent/sub_agent/ai_agent_timetable/`"
        )

# Ensure GOOGLE_GENAI_API_KEY is set. Try multiple fallbacks so local
# development using `.env` or `GOOGLE_API_KEY` works without extra setup.
if not os.environ.get("GOOGLE_GENAI_API_KEY"):
    # 1) Accept existing `GOOGLE_API_KEY` environment var
    if os.environ.get("GOOGLE_API_KEY"):
        os.environ["GOOGLE_GENAI_API_KEY"] = os.environ["GOOGLE_API_KEY"]
        print("[INFO] Set GOOGLE_GENAI_API_KEY from env GOOGLE_API_KEY")
    else:
        # 2) Try parsing a `multi_agent/.env` file if present
        env_file = Path(__file__).resolve().parent / "multi_agent" / ".env"
        found = False
        if env_file.exists():
            for raw in env_file.read_text(encoding="utf-8").splitlines():
                line = raw.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip()
                if k == "GOOGLE_GENAI_API_KEY" and v:
                    os.environ["GOOGLE_GENAI_API_KEY"] = v
                    print(f"[INFO] Set GOOGLE_GENAI_API_KEY from {env_file}")
                    found = True
                    break
                if k == "GOOGLE_API_KEY" and v:
                    os.environ["GOOGLE_GENAI_API_KEY"] = v
                    print(f"[INFO] Set GOOGLE_GENAI_API_KEY from {env_file} (GOOGLE_API_KEY)")
                    found = True
                    break

        # 3) Try existing file-based candidates (legacy behavior)
        if not found:
            key_candidates = [
                Path(__file__).resolve().parent / "multi_agent" / ".genai_key",
                Path(__file__).resolve().parent / "multi_agent" / "sub_agent" / "ai_agent_timetable" / "genai_api_key.txt",
            ]
            for cand in key_candidates:
                if cand.exists():
                    val = cand.read_text(encoding="utf-8").strip()
                    if val:
                        os.environ["GOOGLE_GENAI_API_KEY"] = val
                        print(f"[INFO] Set GOOGLE_GENAI_API_KEY from {cand}")
                        found = True
                        break

        if not found and not os.environ.get("GOOGLE_GENAI_API_KEY"):
            raise RuntimeError(
                "Lỗi cấu hình: Thiếu GOOGLE_GENAI_API_KEY.\n"
                "Cách khắc phục nhanh (PowerShell):\n"
                "  $env:GOOGLE_GENAI_API_KEY='YOUR_API_KEY'\n"
                "Hoặc thêm `GOOGLE_API_KEY=...` or `GOOGLE_GENAI_API_KEY=...` to `multi_agent/.env`."
            )

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from multi_agent import root_agent  # multi_agent/__init__.py -> from .agent import root_agent

APP_NAME = "multi_agent"

# Khởi tạo SessionService + Runner dùng chung
session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)


# ====== SCHEMA REQUEST / RESPONSE ======

class ChatRequest(BaseModel):
    message: str
    user_id: str | None = None
    session_id: str | None = None


class ChatResponse(BaseModel):
    answer: str
    user_id: str
    session_id: str


# ====== FASTAPI APP ======

app = FastAPI(title="Chợ Gạo Multi-Agent API")


@app.get("/")
async def health_check():
    return {"status": "ok", "app": APP_NAME}


@app.get("/ping")
async def ping():
    """Endpoint test siêu nhẹ, không liên quan tới agent."""
    return {"pong": True}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Gửi câu hỏi cho multi_agent (timetable + RAG + an toàn mạng).
    Trả về JSON chứa câu trả lời cuối cùng.
    """
    user_id = req.user_id or "anonymous"
    session_id = req.session_id or f"session_{uuid.uuid4().hex[:8]}"

    print(f"[CHAT] >>> New request | user_id={user_id} | session_id={session_id}")
    print(f"[CHAT] message = {req.message!r}")

    # 🔹 Đảm bảo session tồn tại - tạo mới nếu chưa có
    try:
        # Kiểm tra list tất cả sessions
        all_sessions = await session_service.list_sessions(
            app_name=APP_NAME,
            user_id=user_id,
        )
        session_exists = any(s.session_id == session_id for s in all_sessions)
        
        if session_exists:
            print(f"[CHAT] ✅ Using existing session: {session_id}")
        else:
            print(f"[CHAT] Creating new session: {session_id}")
            await session_service.create_session(
                app_name=APP_NAME,
                user_id=user_id,
                session_id=session_id,
            )
            print(f"[CHAT] ✅ Session created successfully: {session_id}")
    except Exception as e:
        print(f"[CHAT] ⚠️ Error managing session: {e}")
        # Thử tạo session mới anyway
        try:
            await session_service.create_session(
                app_name=APP_NAME,
                user_id=user_id,
                session_id=session_id,
            )
            print(f"[CHAT] ✅ Session created on retry: {session_id}")
        except Exception as e2:
            print(f"[CHAT] ❌ Failed to create session: {e2}")
            # Try to continue anyway

    # Tạo nội dung cho ADK
    content = types.Content(
        role="user",
        parts=[types.Part(text=req.message)],
    )

    final_text = "Hiện tại trợ lý chưa trả lời được."

    try:
        # 🔹 Dùng async runner để nhận event trực tiếp trong cùng event loop
        agen = runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=content,
        )

        async for event in agen:
            author = getattr(event, "author", "unknown")
            print(f"[CHAT] Event from: {author}")

            if event.is_final_response() and event.content and event.content.parts:
                text = event.content.parts[0].text
                if text:
                    final_text = text
                break

        print(f"[CHAT] <<< Final answer: {final_text[:80]!r}...")

    except Exception as e:
        print("[CHAT] !!! ERROR trong khi chạy agent")
        traceback.print_exc()
        final_text = (
            "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu. "
            f"Chi tiết kỹ thuật: {type(e).__name__}: {e}"
        )

    return ChatResponse(
        answer=final_text,
        user_id=user_id,
        session_id=session_id,
    )