# timetable_agent/tools.py
import datetime
from firebase_admin import firestore
from .config import DB  # <-- Import DB từ config.py của package
from google.cloud.firestore_v1.base_query import FieldFilter

# --- HÀM TẠO TOOLS (Lấy từ schedule_tools.py) ---
# Mã này tốt hơn vì nó chuẩn hóa ngày và tên lớp
def make_tools(db: firestore.Client):

    # --- Chuẩn hoá ngày ---
    VN_DAY_STD = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ nhật"]
    EN_MAP = {
        "monday": "Thứ 2", "mon": "Thứ 2",
        "tuesday": "Thứ 3", "tue": "Thứ 3", "tues": "Thứ 3",
        "wednesday": "Thứ 4", "wed": "Thứ 4",
        "thursday": "Thứ 5", "thu": "Thứ 5", "thur": "Thứ 5", "thurs": "Thứ 5",
        "friday": "Thứ 6", "fri": "Thứ 6",
        "saturday": "Thứ 7", "sat": "Thứ 7",
        "sunday": "Chủ nhật", "sun": "Chủ nhật",
    }
    VN_MAP = {
        "thu 2": "Thứ 2", "t2": "Thứ 2", "thứ hai": "Thứ 2", "hai": "Thứ 2",
        "thu 3": "Thứ 3", "t3": "Thứ 3", "thứ ba": "Thứ 3", "ba": "Thứ 3",
        "thu 4": "Thứ 4", "t4": "Thứ 4", "thứ tư": "Thứ 4", "tư": "Thứ 4",
        "thu 5": "Thứ 5", "t5": "Thứ 5", "thứ năm": "Thứ 5", "năm": "Thứ 5",
        "thu 6": "Thứ 6", "t6": "Thứ 6", "thứ sáu": "Thứ 6", "sáu": "Thứ 6",
        "thu 7": "Thứ 7", "t7": "Thứ 7", "thứ bảy": "Thứ 7", "bảy": "Thứ 7",
        "cn": "Chủ nhật", "chủ nhật": "Chủ nhật",
    }

    def _today_str() -> str:
        # weekday(): 0=Mon..6=Sun
        return VN_DAY_STD[datetime.datetime.now().weekday()]

    def _tomorrow_str() -> str:
        i = (datetime.datetime.now().weekday() + 1) % 7
        return VN_DAY_STD[i]

    def normalize_day(day: str) -> str:
        d = (day or "").strip().lower()
        if d in ("", "hôm nay", "today"):
            return _today_str()
        if d in ("ngày mai", "mai", "tomorrow"):
            return _tomorrow_str()
        if d.isdigit():  # "2".."7"
            n = int(d)
            if 2 <= n <= 7:
                return VN_DAY_STD[n-2]
        if d in EN_MAP:
            return EN_MAP[d]
        if d in VN_MAP:
            return VN_MAP[d]
        # Thử “thứ x” không dấu
        d2 = d.replace("thu", "thứ").replace(" ", "")
        for std in VN_DAY_STD:
            if d.startswith(std.lower()) or d2.startswith(std.lower().replace(" ","")):
                return std
        return d.capitalize()  # fallback

    def _list_days_available_for_class(class_name_up: str):
        # Tìm vài doc để gợi ý
        try:
            qs = (
                db.collection("timetables_by_class")
                .where("class_name", "==", class_name_up)
                .limit(7)
                .stream()
            )
            days = []
            for doc in qs:
                data = doc.to_dict() or {}
                if "day" in data:
                    days.append(data["day"])
                else:
                    # Nếu schema không có field 'day', suy ra từ id
                    did = doc.id
                    if "_" in did:
                        maybe_day = did.split("_", 1)[1]
                        days.append(maybe_day)
            return sorted(set(days))
        except Exception:
            return []

    def get_class_schedule(class_name: str, day: str = ""):
        """
        Lịch học của 1 lớp theo ngày.
        - class_name: VD '10A1'
        - day: 'Thứ 2'...'Chủ nhật' | t2 | hom nay | monday | 2 | ...
        """
        # --- ĐÂY LÀ SỬA LỖI QUAN TRỌNG ---
        cls = (class_name or "").strip().upper() # <-- Chuẩn hóa "10a1" -> "10A1"
        dstd = normalize_day(day) # <-- Chuẩn hóa ngày

        # 1) Thử dạng doc id gép
        doc_id = f"{cls}_{dstd}"
        snap = db.collection("timetables_by_class").document(doc_id).get()
        if snap.exists:
            data = snap.to_dict() or {}
            return data.get("schedule") or data

        # 2) Thử truy vấn theo field (nếu bạn seed dạng có field class_name & day)
        qs = db.collection("timetables_by_class") \
        .where(filter=FieldFilter("class_name", "==", cls)) \
        .where(filter=FieldFilter("day", "==", dstd)) \
        .limit(1) \
        .stream()
        for doc in qs:
            data = doc.to_dict() or {}
            return data.get("schedule") or data

        # 3) Gợi ý ngày có sẵn
        suggestions = _list_days_available_for_class(cls)
        hint = f" Các ngày có sẵn: {', '.join(suggestions)}." if suggestions else ""
        return f"Không tìm thấy TKB: {cls} - {dstd}.{hint}"

    def _list_days_available_for_teacher(teacher: str):
        try:
            qs = (
                db.collection("timetables_by_teacher")
                .where("teacher_name", "==", teacher)
                .limit(7)
                .stream()
            )
            days = []
            for doc in qs:
                data = doc.to_dict() or {}
                if "day" in data:
                    days.append(data["day"])
                else:
                    did = doc.id
                    if "_" in did:
                        days.append(did.split("_", 1)[1])
            return sorted(set(days))
        except Exception:
            return []

    def get_teacher_schedule(teacher_name: str, day: str = ""):
        """
        Lịch dạy của giáo viên theo ngày.
        """
        t = (teacher_name or "").strip() # <-- Chuẩn hóa tên GV
        dstd = normalize_day(day) # <-- Chuẩn hóa ngày

        # 1) doc id gép
        doc_id = f"{t}_{dstd}"
        snap = db.collection("timetables_by_teacher").document(doc_id).get()
        if snap.exists:
            data = snap.to_dict() or {}
            return data.get("teaching") or data

        # 2) truy vấn theo field
        qs = (
            db.collection("timetables_by_teacher")
            .where("teacher_name", "==", t)
            .where("day", "==", dstd)
            .limit(1)
            .stream()
        )
        for doc in qs:
            data = doc.to_dict() or {}
            return data.get("teaching") or data

        suggestions = _list_days_available_for_teacher(t)
        hint = f" Các ngày có sẵn: {', '.join(suggestions)}." if suggestions else ""
        return f"Không tìm thấy lịch dạy: {t} - {dstd}.{hint}"

    # Trả về danh sách các hàm tools mà agent sẽ sử dụng
    return [get_class_schedule, get_teacher_schedule]


# --- PHẦN QUAN TRỌNG ĐỂ KẾT NỐI VỚI AGENT ---
# Gọi hàm make_tools với DB đã được import từ config.py
# để tạo ra danh sách tools cho agent.py nhập vào.
TIMETABLE_TOOLS = make_tools(DB)