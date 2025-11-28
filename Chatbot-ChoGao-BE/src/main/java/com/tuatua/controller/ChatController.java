package com.tuatua.controller;

import com.tuatua.dto.ChatRequest;
import com.tuatua.dto.ChatResponse;
import com.tuatua.entity.ChatMessage;
import com.tuatua.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * Endpoint gửi tin nhắn: Gọi tới Google ADK AI Agent
     */
    @PostMapping
    public ResponseEntity<ChatResponse> chatWithBot(@RequestBody ChatRequest chatRequest, Authentication authentication) {
        String userEmail = authentication.getName();

        try {
            // Logic xử lý đã được chuyển hết vào Service
            String botResponse = chatService.processUserMessage(userEmail, chatRequest);
            return ResponseEntity.ok(new ChatResponse(true, botResponse));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ChatResponse(false, "Lỗi khi xử lý tin nhắn: " + e.getMessage()));
        }
    }

    /**
     * Lấy lịch sử chat
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(Authentication authentication) {
        String userEmail = authentication.getName();
        try {
            List<ChatMessage> history = chatService.getChatHistory(userEmail);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}