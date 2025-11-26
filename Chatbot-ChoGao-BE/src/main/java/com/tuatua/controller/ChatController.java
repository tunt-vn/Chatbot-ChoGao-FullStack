package com.tuatua.controller;

import com.tuatua.dto.ChatRequest;
import com.tuatua.dto.ChatResponse;
import com.tuatua.entity.ChatMessage;
import com.tuatua.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * Endpoint để gửi tin nhắn mới đến bot.
     */
    @PostMapping
    public ResponseEntity<ChatResponse> chatWithBot(@RequestBody ChatRequest chatRequest, Authentication authentication) {
        // Lấy email của người dùng đã xác thực từ đối tượng Authentication
        if (authentication == null || authentication.getName() == null) {
            ChatResponse errorResponse = new ChatResponse(
                "Xin lỗi, bạn cần đăng nhập để sử dụng chat.",
                LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
                "anonymous"
            );
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        String userEmail = authentication.getName();

        try {
            // Gọi ChatService để xử lý
            String botResponse = chatService.processUserMessage(userEmail, chatRequest);
            
            // Tạo response chuẩn cho Frontend
            ChatResponse response = new ChatResponse(
                botResponse,
                LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
                "user-session-" + userEmail
            );
            
            System.out.println("DEBUG: ChatController returning response: " + response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            // Trả về error response
            ChatResponse errorResponse = new ChatResponse(
                "Xin lỗi, đã có lỗi xảy ra khi xử lý tin nhắn: " + e.getMessage(),
                LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
                "user-session-" + userEmail
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Endpoint để lấy lịch sử chat của người dùng hiện tại.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        String userEmail = authentication.getName();
        try {
            List<ChatMessage> history = chatService.getChatHistory(userEmail);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            System.err.println("Error loading chat history for user: " + userEmail);
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }
}