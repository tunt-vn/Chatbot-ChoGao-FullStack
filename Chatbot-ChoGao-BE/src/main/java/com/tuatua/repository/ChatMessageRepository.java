package com.tuatua.repository;

import com.tuatua.entity.ChatMessage;
import com.tuatua.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findByUserOrderByTimestampAsc(User user);
    
    List<ChatMessage> findByUserIdOrderByTimestampAsc(Long userId);
    
    List<ChatMessage> findByUserOrderByTimestampDesc(User user);
    
    List<ChatMessage> findByUserIdOrderByTimestampDesc(Long userId);
}
