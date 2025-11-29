package com.tuatua.service;

import com.tuatua.entity.CalendarEvent;
import com.tuatua.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;
    private final FirestoreService firestoreService;

    /**
     * Lấy tất cả sự kiện sắp tới
     */
    public List<CalendarEvent> getUpcomingEvents() {
        return calendarEventRepository.findUpcomingEvents(LocalDateTime.now());
    }

    /**
     * Lấy tất cả sự kiện
     */
    public List<CalendarEvent> getAllEvents() {
        return calendarEventRepository.findAllByOrderByStartTimeAsc();
    }

    /**
     * Lấy sự kiện trong khoảng thời gian
     */
    public List<CalendarEvent> getEventsByDateRange(LocalDateTime start, LocalDateTime end) {
        return calendarEventRepository.findEventsBetween(start, end);
    }

    /**
     * Lấy sự kiện theo loại
     */
    public List<CalendarEvent> getEventsByType(CalendarEvent.EventType eventType) {
        return calendarEventRepository.findByEventTypeOrderByStartTimeAsc(eventType);
    }

    /**
     * Lấy sự kiện theo lớp
     */
    public List<CalendarEvent> getEventsByClass(String className) {
        return calendarEventRepository.findByClassNameOrderByStartTimeAsc(className);
    }

    /**
     * Lấy một sự kiện theo ID
     */
    public Optional<CalendarEvent> getEventById(Long id) {
        return calendarEventRepository.findById(id);
    }

    /**
     * Tạo sự kiện mới và đồng bộ sang Firestore
     */
    @Transactional
    public CalendarEvent createEvent(CalendarEvent event) {
        // 1. Lưu vào Database (để có ID)
        CalendarEvent savedEvent = calendarEventRepository.save(event);

        // 2. Đồng bộ sang Firestore
        firestoreService.syncEventToFirestore(savedEvent);

        return savedEvent;
    }

    /**
     * Cập nhật sự kiện và đồng bộ sang Firestore
     */
    @Transactional
    public Optional<CalendarEvent> updateEvent(Long id, CalendarEvent eventDetails) {
        return calendarEventRepository.findById(id).map(existingEvent -> {
            // Cập nhật các trường thông tin
            existingEvent.setTitle(eventDetails.getTitle());
            existingEvent.setDescription(eventDetails.getDescription());
            existingEvent.setStartTime(eventDetails.getStartTime());
            existingEvent.setEndTime(eventDetails.getEndTime());
            existingEvent.setEventType(eventDetails.getEventType());
            existingEvent.setLocation(eventDetails.getLocation());
            existingEvent.setTargetAudience(eventDetails.getTargetAudience());
            existingEvent.setSubject(eventDetails.getSubject());
            existingEvent.setTeacherName(eventDetails.getTeacherName());
            existingEvent.setClassName(eventDetails.getClassName());
            existingEvent.setRecurring(eventDetails.isRecurring());
            existingEvent.setRecurringPattern(eventDetails.getRecurringPattern());

            // updatedAt được tự động cập nhật bởi @PreUpdate trong Entity

            // 1. Lưu thay đổi vào Database
            CalendarEvent updatedEvent = calendarEventRepository.save(existingEvent);

            // 2. Đồng bộ sang Firestore
            firestoreService.syncEventToFirestore(updatedEvent);

            return updatedEvent;
        });
    }

    /**
     * Xóa sự kiện và xóa khỏi Firestore
     */
    @Transactional
    public boolean deleteEvent(Long id) {
        if (calendarEventRepository.existsById(id)) {
            // 1. Xóa khỏi Database
            calendarEventRepository.deleteById(id);

            // 2. Xóa khỏi Firestore
            firestoreService.deleteEventFromFirestore(id);

            return true;
        }
        return false;
    }

    /**
     * Chuyển đổi string thành EventType với xử lý lỗi
     */
    public Optional<CalendarEvent.EventType> parseEventType(String eventTypeStr) {
        try {
            return Optional.of(CalendarEvent.EventType.valueOf(eventTypeStr.toUpperCase()));
        } catch (IllegalArgumentException | NullPointerException e) {
            return Optional.empty();
        }
    }
}