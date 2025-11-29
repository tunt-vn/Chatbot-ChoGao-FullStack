# timetable_agent/tools.py
import datetime
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from .config import DB  # Import DB từ config chung

def make_tools(db: firestore.Client):

    # --- 1. CÁC HÀM XỬ LÝ NGÀY THÁNG TIẾNG VIỆT ---
    VN_DAY_STD = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
    
    # Map từ khóa tiếng Việt/Anh sang chuẩn "Thứ X"
    DAY_MAP = {
        # Tiếng Việt không dấu / viết tắt
        "thu 2": "Thứ 2", "t2": "Thứ 2", "thu hai": "Thứ 2", "hai": "Thứ 2",
        "thu 3": "Thứ 3", "t3": "Thứ 3", "thu ba": "Thứ 3", "ba": "Thứ 3",
        "thu 4": "Thứ 4", "t4": "Thứ 4", "thu tu": "Thứ 4", "tu": "Thứ 4",
        "thu 5": "Thứ 5", "t5": "Thứ 5", "thu nam": "Thứ 5", "nam": "Thứ 5",
        "thu 6": "Thứ 6", "t6": "Thứ 6", "thu sau": "Thứ 6", "sau": "Thứ 6",
        "thu 7": "Thứ 7", "t7": "Thứ 7", "thu bay": "Thứ 7", "bay": "Thứ 7",
        "cn": "Chủ nhật", "chu nhat": "Chủ nhật", "sun": "Chủ nhật",
        # Tiếng Anh
        "monday": "Thứ 2", "mon": "Thứ 2",
        "tuesday": "Thứ 3", "tue": "Thứ 3",
        "wednesday": "Thứ 4", "wed": "Thứ 4",
        "thursday": "Thứ 5", "thu": "Thứ 5",
        "friday": "Thứ 6", "fri": "Thứ 6",
        "saturday": "Thứ 7", "sat": "Thứ 7",
        "sunday": "Chủ nhật"
    }

    def _get_current_day_str(offset=0) -> str:
        """Lấy thứ hiện tại hoặc tương lai (+offset ngày)"""
        idx = (datetime.datetime.now().weekday() + offset) % 7
        return VN_DAY_STD[idx]

    def normalize_day(day_input: str) -> str:
        """Chuyển đổi input lộn xộn thành chuẩn 'Thứ 2', 'Thứ 3'..."""
        d = (day_input or "").strip().lower()
        
        # Xử lý từ khóa đặc biệt
        if d in ["", "hôm nay", "bữa nay", "today", "now"]:
            return _get_current_day_str(0)
        if d in ["ngày mai", "mai", "tomorrow"]:
            return _get_current_day_str(1)
        if d in ["ngày kia", "mốt"]:
            return _get_current_day_str(2)

        # Xử lý số (vd: "2" -> "Thứ 2")
        if d.isdigit() and 2 <= int(d) <= 7:
            return f"Thứ {d}"
            
        # Xử lý theo Map
        if d in DAY_MAP:
            return DAY_MAP[d]
            
        # Fallback: Trả về nguyên gốc nhưng viết hoa chữ cái đầu (hy vọng đúng)
        return day_input.title()

    # --- 2. CÁC HÀM TRUY VẤN FIRESTORE (TOOLS) ---

    def get_class_schedule(class_name: str, day: str = ""):
        """
        Tra cứu thời khóa biểu của một lớp học.
        Args:
            class_name: Tên lớp (ví dụ: '10A1', '12C3').
            day: Ngày cần xem (ví dụ: 'hôm nay', 'thứ 2', 'mai').
        Returns:
            Danh sách các tiết học hoặc thông báo lỗi.
        """
        # Chuẩn hóa dữ liệu đầu vào
        target_class = (class_name or "").strip().upper()
        target_day = normalize_day(day)

        print(f"[Tool] Searching TKB Class: {target_class}, Day: {target_day}")

        try:
            # Query vào collection 'timetables' (Cấu trúc phẳng mới)
            # Lọc theo class_name VÀ day
            docs = (
                db.collection("timetables")
                .where(filter=FieldFilter("class_name", "==", target_class))
                .where(filter=FieldFilter("day", "==", target_day))
                .stream()
            )

            schedule_list = []
            for doc in docs:
                data = doc.to_dict()
                schedule_list.append({
                    "Môn": data.get("subject", "Không rõ"),
                    "Giờ": f"{data.get('start_time')} - {data.get('end_time')}",
                    "Phòng": data.get("room", "N/A"),
                    "Giáo viên": data.get("teacher", "N/A"),
                    "Loại": data.get("type", "")
                })

            # Sắp xếp theo giờ học
            schedule_list.sort(key=lambda x: x["Giờ"])

            if not schedule_list:
                return f"Không tìm thấy lịch học cho lớp {target_class} vào {target_day}. (Có thể là ngày nghỉ hoặc tên lớp chưa đúng)."

            return {
                "lớp": target_class,
                "ngày": target_day,
                "lịch_học": schedule_list
            }

        except Exception as e:
            return f"Lỗi khi truy vấn dữ liệu: {str(e)}"

    def get_teacher_schedule(teacher_name: str, day: str = ""):
        """
        Tra cứu lịch dạy của giáo viên.
        Args:
            teacher_name: Tên giáo viên (ví dụ: 'Nguyễn Văn A').
            day: Ngày cần xem.
        """
        target_teacher = (teacher_name or "").strip()
        target_day = normalize_day(day)

        print(f"[Tool] Searching Teacher: {target_teacher}, Day: {target_day}")

        try:
            # Query vào collection 'timetables'
            # Lọc theo teacher VÀ day
            docs = (
                db.collection("timetables")
                .where(filter=FieldFilter("teacher", "==", target_teacher))
                .where(filter=FieldFilter("day", "==", target_day))
                .stream()
            )

            teaching_list = []
            for doc in docs:
                data = doc.to_dict()
                teaching_list.append({
                    "Lớp": data.get("class_name", "N/A"),
                    "Môn": data.get("subject", ""),
                    "Giờ": f"{data.get('start_time')} - {data.get('end_time')}",
                    "Phòng": data.get("room", "")
                })

            teaching_list.sort(key=lambda x: x["Giờ"])

            if not teaching_list:
                return f"Không tìm thấy lịch dạy của thầy/cô {target_teacher} vào {target_day}."

            return {
                "giáo_viên": target_teacher,
                "ngày": target_day,
                "lịch_dạy": teaching_list
            }

        except Exception as e:
            return f"Lỗi khi truy vấn: {str(e)}"

    # Trả về danh sách tools
    return [get_class_schedule, get_teacher_schedule]

# --- KẾT NỐI VỚI AGENT ---
TIMETABLE_TOOLS = make_tools(DB)