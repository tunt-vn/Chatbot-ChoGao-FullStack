from google.adk.agents.llm_agent import Agent
from google import genai
from google.genai import types

import os
import time
import json
from pathlib import Path

# Khởi tạo client Gemini
client = genai.Client()

# Đường dẫn cơ bản của package rag_agent
BASE_DIR = Path(__file__).resolve().parent
DOCS_DIR = BASE_DIR / "docs"

# File để lưu trạng thái file đã index (tên file + mtime)
INDEX_STATE_FILE = BASE_DIR / "indexed_files.json"
# File để lưu tên File Search Store (để tái sử dụng giữa các lần khởi động)
STORE_NAME_FILE = BASE_DIR / "file_search_store_name.txt"


# ----------------- HÀM QUẢN LÝ FILE SEARCH STORE -----------------


def get_or_create_file_search_store() -> str:
    """
    Lấy File Search Store name đã lưu, nếu chưa có thì tạo mới và lưu lại.
    """
    if STORE_NAME_FILE.exists():
        store_name = STORE_NAME_FILE.read_text(encoding="utf-8").strip()
        if store_name:
            print(f"[INFO] Dùng lại File Search store: {store_name}")
            return store_name

    # Chưa có store → tạo mới
    store = client.file_search_stores.create(
        config={"display_name": "school-docs-store"}
    )
    STORE_NAME_FILE.write_text(store.name, encoding="utf-8")
    print(f"[INFO] Tạo File Search store mới: {store.name}")
    return store.name


def load_index_state() -> dict:
    """
    Đọc trạng thái file đã index (từ JSON).
    Lưu dạng: { "ten_file.pdf": mtime, ... }
    """
    if not INDEX_STATE_FILE.exists():
        return {}
    try:
        with INDEX_STATE_FILE.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def save_index_state(state: dict) -> None:
    """
    Ghi trạng thái file đã index xuống JSON.
    """
    with INDEX_STATE_FILE.open("w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def index_docs_into_store(file_search_store_name: str) -> None:
    """
    Index tất cả file trong thư mục docs/ vào File Search Store.

    - Hỗ trợ: .txt, .pdf, .doc, .docx
    - Nếu file đã index rồi và không thay đổi (mtime giống), sẽ bỏ qua.
    - Nếu có file mới hoặc file cũ bị sửa → upload & index lại.
    """
    if not DOCS_DIR.exists():
        print(f"[WARN] Thư mục docs không tồn tại: {DOCS_DIR}")
        print("       Hãy tạo thư mục này và bỏ tài liệu của trường vào (PDF, DOCX, TXT...).")
        return

    supported_ext = {".txt", ".pdf", ".doc", ".docx"}
    old_state = load_index_state()
    new_state = dict(old_state)

    for path in DOCS_DIR.iterdir():
        if not path.is_file():
            continue
        if path.suffix.lower() not in supported_ext:
            continue

        file_key = path.name
        mtime = path.stat().st_mtime

        # Nếu file đã index và chưa đổi gì → bỏ qua
        if file_key in old_state and old_state[file_key] >= mtime:
            continue

        print(f"[INFO] Đang upload & index file: {path.name}")

        # Upload & index trực tiếp file vào File Search Store
        operation = client.file_search_stores.upload_to_file_search_store(
            file_search_store_name=file_search_store_name,
            file=str(path),
            config={
                "display_name": path.name,
                "chunking_config": {
                    "white_space_config": {
                        # Chunking phù hợp tiếng Việt:
                        "max_tokens_per_chunk": 220,
                        "max_overlap_tokens": 40,
                    }
                },
            },
        )

        # Đợi operation hoàn tất
        while not operation.done:
            print("   → Đang xử lý, đợi 3s...")
            time.sleep(3)
            operation = client.operations.get(operation)

        print(f"[INFO] File '{path.name}' đã được index xong.\n")
        new_state[file_key] = mtime

    save_index_state(new_state)
    print("[INFO] ✅ Đã cập nhật index cho tất cả file mới/sửa trong docs/.")


# ----------------- KHỞI TẠO STORE & INDEX NGAY KHI IMPORT MODULE -----------------

_file_search_store_name = get_or_create_file_search_store()
index_docs_into_store(_file_search_store_name)


# ----------------- TOOL DÙNG FILE SEARCH (RAG) -----------------


def search_documents(query: str) -> str:
    """
    Tool: Tìm kiếm thông tin trong các tài liệu của trường bằng File Search.

    Dùng tool này khi cần trả lời các câu hỏi liên quan đến:
    - quy định, nội quy, chương trình học
    - thông tin tuyển sinh, điều kiện, hồ sơ, thời gian
    - học phí, học bổng, chính sách hỗ trợ, ...
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=query,
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=[_file_search_store_name]
                    )
                )
            ],
            temperature=0.1,
            max_output_tokens=1024,
        ),
    )
    return response.text


# ----------------- ĐỊNH NGHĨA LLM AGENT (ADK) -----------------


root_agent = Agent(
    model="gemini-2.5-flash",
    name="root_agent",
    description=(
        "Trợ lý ảo hỗ trợ phụ huynh và học sinh về thông tin của trường "
        "và thông tin tuyển sinh, sử dụng dữ liệu từ các tài liệu trong thư mục docs."
    ),
    instruction="""
    Bạn là TRỢ LÝ ẢO CỦA TRƯỜNG HỌC, hỗ trợ PHỤ HUYNH và HỌC SINH.

    Nhiệm vụ chính của bạn:
    - Giải thích rõ ràng, dễ hiểu các thông tin có trong tài liệu của trường, ví dụ:
      + giới thiệu về trường, chương trình học, thời khóa biểu
      + nội quy, quy chế, quy định về điểm số / hạnh kiểm
      + học phí, chính sách hỗ trợ, học bổng
      + hoạt động ngoại khóa, câu lạc bộ
    - Tư vấn về TUYỂN SINH:
      + đối tượng tuyển sinh, điều kiện / tiêu chí xét tuyển
      + hồ sơ, giấy tờ cần chuẩn bị
      + mốc thời gian: nộp hồ sơ, thi, phỏng vấn, nhập học, ...
      + hình thức xét tuyển / thi tuyển nếu có

    Cách trả lời:
    - LUÔN trả lời bằng TIẾNG VIỆT, giọng điệu thân thiện, lịch sự, dễ hiểu.
    - Dùng gạch đầu dòng khi liệt kê điều kiện, hồ sơ, các bước thực hiện.
    - Nếu câu hỏi có nhiều ý, hãy chia thành từng mục nhỏ cho dễ đọc.

    Cách dùng tool:
    - Khi câu hỏi liên quan đến thông tin có trong tài liệu (quy chế, tuyển sinh, học phí,...),
      HÃY GỌI tool `search_documents` với nội dung câu hỏi để tra cứu tài liệu.
    - Sau khi tra cứu, hãy tóm tắt và giải thích lại nội dung cho phụ huynh / học sinh một cách dễ hiểu.

    Rất quan trọng:
    - ƯU TIÊN dựa trên nội dung trong các tài liệu đã được cung cấp (File Search store).
    - Không bịa ra thông tin không có trong tài liệu, đặc biệt là:
      + mức học phí, điểm chuẩn, các mốc thời gian cụ thể.
    - Nếu không tìm thấy thông tin trong tài liệu, hãy nói rõ:
      "Em/ tôi không thấy thông tin này trong tài liệu hiện có. Anh/chị vui lòng liên hệ trực tiếp nhà trường để được cập nhật chính xác."
    """,
    tools=[search_documents],  # ✅ ADK yêu cầu khai báo tool ở đây
    generate_content_config=types.GenerateContentConfig(
        temperature=0.2,
        max_output_tokens=1024,
        # ❌ Không đặt tools ở đây, nếu không sẽ bị ValidationError
    ),
)
