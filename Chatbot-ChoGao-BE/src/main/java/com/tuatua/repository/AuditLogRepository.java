// AuditLogRepository.java
package com.tuatua.repository;
import com.tuatua.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}