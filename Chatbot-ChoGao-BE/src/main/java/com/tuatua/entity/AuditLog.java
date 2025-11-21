package com.tuatua.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String performedBy; // Email của admin thực hiện
    private String action;      // Ví dụ: "CREATE_USER", "UPDATE_CONFIG"
    private String target;      // Đối tượng bị tác động
    private String details;     // Chi tiết thay đổi

    @CreationTimestamp
    private LocalDateTime timestamp;
}