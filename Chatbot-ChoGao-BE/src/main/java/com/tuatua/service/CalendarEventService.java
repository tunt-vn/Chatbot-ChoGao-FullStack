package com.tuatua.service;

import com.tuatua.entity.CalendarEvent;
import com.tuatua.repository.CalendarEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CalendarEventService {

    @Autowired
    private CalendarEventRepository calendarEventRepository;

    public List<CalendarEvent> getAllEvents() {
        return calendarEventRepository.findAll();
    }

    public Optional<CalendarEvent> getEventById(Long id) {
        return calendarEventRepository.findById(id);
    }

    public CalendarEvent createEvent(CalendarEvent event) {
        return calendarEventRepository.save(event);
    }

    public Optional<CalendarEvent> updateEvent(Long id, CalendarEvent eventDetails) {
        return calendarEventRepository.findById(id).map(event -> {
            event.setDescription(eventDetails.getDescription());
            event.setEndTime(eventDetails.getEndTime());
            event.setEventType(eventDetails.getEventType());
            event.setIsRecurring(eventDetails.getIsRecurring());
            event.setLocation(eventDetails.getLocation());
            event.setRecurringPattern(eventDetails.getRecurringPattern());
            event.setStartTime(eventDetails.getStartTime());
            event.setSubject(eventDetails.getSubject());
            event.setTargetAudience(eventDetails.getTargetAudience());
            event.setTeacherName(eventDetails.getTeacherName());
            event.setTitle(eventDetails.getTitle());
            event.setClassName(eventDetails.getClassName());
            // updatedAt is handled by @UpdateTimestamp
            return calendarEventRepository.save(event);
        });
    }

    public boolean deleteEvent(Long id) {
        if (calendarEventRepository.existsById(id)) {
            calendarEventRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
