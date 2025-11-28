// AnnouncementRepository.java
package com.tuatua.repository;
import com.tuatua.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
}