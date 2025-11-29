package com.tuatua.service;

import com.tuatua.dto.AiAgentRequest;
import com.tuatua.dto.AiAgentResponse;
import com.tuatua.dto.ChatRequest;
import com.tuatua.entity.ChatMessage;
import com.tuatua.entity.User;
import com.tuatua.repository.ChatMessageRepository;
import com.tuatua.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository; // Đã đổi từ StudentRepository sang UserRepository
    private final RestTemplate restTemplate;

    @Value("${app.ai-agent.url}") // Đọc từ application.properties
    private String aiAgentUrl;

    /**
     * Xử lý tin nhắn từ người dùng, gọi AI Agent và lưu lịch sử.
     */
    @Transactional

    public String processUserMessage(String userEmail, ChatRequest chatRequest) {
// 1. Lấy thông tin User từ email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy User với email: " + userEmail));

// 2. Lưu tin nhắn của người dùng vào DB
        ChatMessage userMessage = new ChatMessage(user, ChatMessage.SenderType.USER, chatRequest.getMessage());
        chatMessageRepository.save(userMessage);
// 3. Chuẩn bị request gửi sang AI Agent
// Dùng ID của user làm user_id cho AI Agent
        AiAgentRequest aiRequest = new AiAgentRequest(chatRequest.getMessage(), String.valueOf(user.getId()));
        String botAnswer = "Xin lỗi, hệ thống đang bận.";
        try {

// 4. Gọi API sang Python Server
            ResponseEntity<AiAgentResponse> responseEntity = restTemplate.postForEntity(
                    aiAgentUrl,
                    aiRequest,
                    AiAgentResponse.class
            );
            AiAgentResponse aiResponse = responseEntity.getBody();
            if (aiResponse != null && aiResponse.getAnswer() != null) {
                botAnswer = aiResponse.getAnswer();
// Bạn có thể lưu thêm sessionId nếu muốn: aiResponse.getSessionId()
            }
        } catch (Exception e) {
            e.printStackTrace();
            botAnswer = "Lỗi kết nối đến trợ lý ảo: " + e.getMessage();
        }
// 5. Lưu tin nhắn phản hồi của Bot vào DB
        ChatMessage botMessage = new ChatMessage(user, ChatMessage.SenderType.BOT, botAnswer);
        chatMessageRepository.save(botMessage);
// 6. Trả về câu trả lời
        return botAnswer;
    }

    /**
     * Lấy lịch sử chat của người dùng.
     */
    public List<ChatMessage> getChatHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy User với email: " + userEmail));
        return chatMessageRepository.findByUserOrderByTimestampDesc(user);
    }
}