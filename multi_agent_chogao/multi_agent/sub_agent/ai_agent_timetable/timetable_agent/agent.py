# D:\ai-agent-tkb-cho-gao\timetable_agent\agent.py
from google.adk.agents import Agent
from .tools import TIMETABLE_TOOLS

# Đổi tên biến thành 'root_agent'
root_agent = Agent(
    name="timetable_agent",
    model="gemini-2.0-flash",
    description="Agent trả lời về thời khóa biểu THPT Chợ Gạo",
    instruction=(
        "Bạn là trợ lý thời khóa biểu THPT Chợ Gạo. "
        "Luôn trả lời ngắn gọn, tiếng Việt, nêu rõ tiết/phòng/giáo viên khi có. "
        "Nếu người dùng nói 'hôm nay' hoặc không nêu ngày, hiểu là ngày hiện tại."
    ),
    tools=TIMETABLE_TOOLS,
)