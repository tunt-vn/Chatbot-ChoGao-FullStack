package com.tuatua.controller;

import com.tuatua.entity.CalendarEvent;
import com.tuatua.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {
    
    private final CalendarEventRepository calendarEventRepository;
    
    /**
     * Lấy tất cả sự kiện sắp tới
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<CalendarEvent>> getUpcomingEvents() {
        List<CalendarEvent> events = calendarEventRepository.findUpcomingEvents(LocalDateTime.now());
        return ResponseEntity.ok(events);
    }
    
    /**
     * Lấy tất cả sự kiện
     */
    @GetMapping
    public ResponseEntity<List<CalendarEvent>> getAllEvents() {
        List<CalendarEvent> events = calendarEventRepository.findAllByOrderByStartTimeAsc();
        return ResponseEntity.ok(events);
    }
    
    /**
     * Lấy sự kiện trong khoảng thời gian
     */
    @GetMapping("/range")
    public ResponseEntity<List<CalendarEvent>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<CalendarEvent> events = calendarEventRepository.findEventsBetween(start, end);
        return ResponseEntity.ok(events);
    }
    
    /**
     * Lấy sự kiện theo loại
     */
    @GetMapping("/type/{eventType}")
    public ResponseEntity<List<CalendarEvent>> getEventsByType(@PathVariable String eventType) {
        try {
            CalendarEvent.EventType type = CalendarEvent.EventType.valueOf(eventType.toUpperCase());
            List<CalendarEvent> events = calendarEventRepository.findByEventTypeOrderByStartTimeAsc(type);
            return ResponseEntity.ok(events);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lấy sự kiện theo lớp
     */
    @GetMapping("/class/{className}")
    public ResponseEntity<List<CalendarEvent>> getEventsByClass(@PathVariable String className) {
        List<CalendarEvent> events = calendarEventRepository.findByClassNameOrderByStartTimeAsc(className);
        return ResponseEntity.ok(events);
    }
    
    /**
     * Lấy một sự kiện theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CalendarEvent> getEventById(@PathVariable Long id) {
        return calendarEventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
