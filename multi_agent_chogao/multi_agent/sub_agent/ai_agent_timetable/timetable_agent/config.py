# agent_package/config.py
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

def load_and_validate_env():
    load_dotenv()
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
    api_key = (
        os.getenv("GOOGLE_GENAI_API_KEY", "").strip()
        or os.getenv("GOOGLE_API_KEY", "").strip()
    )
    if not cred_path:
        raise EnvironmentError("Thiếu GOOGLE_APPLICATION_CREDENTIALS")
    if not Path(cred_path).exists():
        raise FileNotFoundError(f"Không tìm thấy file service account: {cred_path}")
    if not api_key:
        raise EnvironmentError("Thiếu GOOGLE_GENAI_API_KEY")
    return cred_path, api_key

def init_firestore(cred_path: str) -> firestore.Client:
    cred = credentials.Certificate(cred_path)
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)
    return firestore.client()

# --- Khởi tạo mọi thứ ở đây ---
try:
    CRED_PATH, API_KEY = load_and_validate_env()
    os.environ["GOOGLE_API_KEY"] = API_KEY # Set env cho ADK
    DB = init_firestore(CRED_PATH)
except Exception as e:
    print(f"⚠️ Lỗi cấu hình: {e}", file=sys.stderr)
    sys.exit(1)