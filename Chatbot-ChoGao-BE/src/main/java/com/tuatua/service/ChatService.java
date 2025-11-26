package com.tuatua.service;

import com.tuatua.dto.ChatRequest;
import com.tuatua.entity.ChatMessage;
import com.tuatua.entity.User;
import com.tuatua.repository.ChatMessageRepository;
import com.tuatua.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final MultiAgentService multiAgentService;

    /**
     * Xử lý tin nhắn đến từ người dùng, gọi multi-agent và lưu lịch sử.
     * @param userEmail Email của người dùng đã xác thực.
     * @param chatRequest DTO chứa tin nhắn của người dùng.
     * @return Phản hồi từ bot.
     * @throws RuntimeException nếu gọi multi-agent thất bại.
     */
    @Transactional
    public String processUserMessage(String userEmail, ChatRequest chatRequest) {
        // 1. Lấy thông tin User từ email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy User với email: " + userEmail));

        // 2. Lấy nội dung tin nhắn (hỗ trợ cả "message" và "chatInput")
        String messageContent = chatRequest.getMessage();
        if (messageContent == null || messageContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Tin nhắn không được để trống");
        }

        // 3. Lưu tin nhắn của người dùng
        ChatMessage userMessage = new ChatMessage(user, ChatMessage.SenderType.USER, messageContent);
        chatMessageRepository.save(userMessage);

        // 4. Tạo sessionId và userId cho multi-agent
        String sessionId = "user-session-" + userEmail;
        String userId = user.getEmail(); // hoặc user.getId().toString()

        // 5. Gọi Multi-Agent API
        String botResponseContent;
        try {
            log.info("Calling multi-agent API with message: {}, userId: {}, sessionId: {}", 
                    messageContent, userId, sessionId);
            botResponseContent = multiAgentService.sendMessageToMultiAgent(
                messageContent, 
                userId, 
                sessionId
            );
            log.info("Received response from multi-agent: {}", 
                    botResponseContent != null ? botResponseContent.substring(0, Math.min(50, botResponseContent.length())) : "null");
        } catch (Exception e) {
            log.error("Error calling multi-agent service", e);
            botResponseContent = "Xin lỗi, đã có lỗi xảy ra khi kết nối với trợ lý AI.";
            throw new RuntimeException("Error connecting to the AI service.", e);
        }

        if (botResponseContent == null || botResponseContent.isEmpty()) {
            botResponseContent = "Xin lỗi, đã có lỗi xảy ra.";
        }

        // 6. Lưu tin nhắn phản hồi của bot
        ChatMessage botMessage = new ChatMessage(user, ChatMessage.SenderType.BOT, botResponseContent);
        chatMessageRepository.save(botMessage);

        // 7. Trả về nội dung phản hồi của bot
        return botResponseContent;
    }

    /**
     * Lấy lịch sử chat của người dùng.
     * @param userEmail Email của người dùng đã xác thực.
     * @return Danh sách tin nhắn, sắp xếp theo thời gian mới nhất trước.
     */
    public List<ChatMessage> getChatHistory(String userEmail) {
        log.debug("Getting chat history for user: {}", userEmail);
        try {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy User với email: " + userEmail));
            List<ChatMessage> history = chatMessageRepository.findByUserOrderByTimestampDesc(user);
            log.debug("Found {} chat messages for user: {}", history.size(), userEmail);
            return history;
        } catch (Exception e) {
            log.error("Error getting chat history for user: {}", userEmail, e);
            throw e;
        }
    }
}