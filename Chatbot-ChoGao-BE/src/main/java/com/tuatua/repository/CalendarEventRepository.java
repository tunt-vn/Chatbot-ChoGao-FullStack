package com.tuatua.repository;

import com.tuatua.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    
    // Lấy sự kiện sắp tới (từ thời điểm hiện tại)
    @Query("SELECT e FROM CalendarEvent e WHERE e.startTime >= :now ORDER BY e.startTime ASC")
    List<CalendarEvent> findUpcomingEvents(@Param("now") LocalDateTime now);
    
    // Lấy sự kiện trong khoảng thời gian
    @Query("SELECT e FROM CalendarEvent e WHERE e.startTime BETWEEN :start AND :end ORDER BY e.startTime ASC")
    List<CalendarEvent> findEventsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // Lấy sự kiện theo loại
    List<CalendarEvent> findByEventTypeOrderByStartTimeAsc(CalendarEvent.EventType eventType);
    
    // Lấy sự kiện theo lớp
    List<CalendarEvent> findByClassNameOrderByStartTimeAsc(String className);
    
    // Lấy tất cả sự kiện sắp xếp theo thời gian
    List<CalendarEvent> findAllByOrderByStartTimeAsc();
}
