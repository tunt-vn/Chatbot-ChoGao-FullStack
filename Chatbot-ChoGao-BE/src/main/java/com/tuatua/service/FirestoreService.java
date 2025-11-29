package com.tuatua.service;

import com.google.cloud.firestore.Firestore;
import com.tuatua.entity.CalendarEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirestoreService {

    private final Firestore firestore;

    public void syncEventToFirestore(CalendarEvent event) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("id", event.getId());
            data.put("subject", event.getTitle()); // Giả sử title là tên môn học
            data.put("teacher", event.getTeacherName());
            data.put("class_name", event.getTargetAudience());
            data.put("room", event.getLocation());
            data.put("description", event.getDescription());
            data.put("type", event.getEventType());

            // Xử lý ngày tháng
            if (event.getStartTime() != null) {
                // Chuyển đổi sang "Thứ 2", "Thứ 3"...
                String dayOfWeek = event.getStartTime().getDayOfWeek()
                        .getDisplayName(TextStyle.FULL, new Locale("vi", "VN"));

                data.put("day", dayOfWeek);
                data.put("date", event.getStartTime().toLocalDate().toString());
                data.put("start_time", event.getStartTime().toLocalTime().toString());
            }

            if (event.getEndTime() != null) {
                data.put("end_time", event.getEndTime().toLocalTime().toString());
            }

            // Ghi vào collection "timetables" với ID là "event_{id}"
            firestore.collection("timetables")
                    .document("event_" + event.getId())
                    .set(data); // .set() sẽ tạo mới hoặc ghi đè (update)

            log.info("Đã đồng bộ sự kiện {} lên Firestore", event.getId());

        } catch (Exception e) {
            log.error("Lỗi khi đồng bộ Firestore: {}", e.getMessage());
        }
    }

    public void deleteEventFromFirestore(Long eventId) {
        try {
            firestore.collection("timetables").document("event_" + eventId).delete();
            log.info("Đã xóa sự kiện {} khỏi Firestore", eventId);
        } catch (Exception e) {
            log.error("Lỗi khi xóa khỏi Firestore: {}", e.getMessage());
        }
    }
}