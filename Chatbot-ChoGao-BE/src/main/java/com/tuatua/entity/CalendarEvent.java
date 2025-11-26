package com.tuatua.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "calendar_events")
public class CalendarEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime endTime;

    private String eventType;

    private Boolean isRecurring;

    private String location;

    private String recurringPattern;

    private LocalDateTime startTime;

    private String subject;

    private String targetAudience;

    private String teacherName;

    private String title;

    @Column(name = "class_name")
    private String className;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
