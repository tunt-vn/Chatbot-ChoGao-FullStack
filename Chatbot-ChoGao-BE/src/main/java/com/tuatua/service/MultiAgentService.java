package com.tuatua.service;

import com.tuatua.dto.MultiAgentRequest;
import com.tuatua.dto.MultiAgentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class MultiAgentService {

    private final RestTemplate restTemplate;

    @Value("${multiagent.api.url}")
    private String multiAgentApiUrl;

    /**
     * Gọi Multi-Agent API để xử lý câu hỏi của người dùng.
     * @param message Tin nhắn từ người dùng
     * @param userId ID người dùng
     * @param sessionId Session ID
     * @return Câu trả lời từ multi-agent
     * @throws RuntimeException nếu gọi multi-agent API thất bại
     */
    public String sendMessageToMultiAgent(String message, String userId, String sessionId) {
        try {
            log.info("Sending message to Multi-Agent API: {}", multiAgentApiUrl);
            log.debug("Message: {}, UserId: {}, SessionId: {}", message, userId, sessionId);
            System.out.println("DEBUG: Calling Multi-Agent API at: " + multiAgentApiUrl);

            MultiAgentRequest request = new MultiAgentRequest();
            request.setMessage(message);
            request.setUserId(userId);
            request.setSessionId(sessionId);
            
            System.out.println("DEBUG: Calling Multi-Agent API at: " + multiAgentApiUrl);
            System.out.println("DEBUG: Request body: " + request);

            ResponseEntity<MultiAgentResponse> response = restTemplate.postForEntity(
                multiAgentApiUrl + "/chat", 
                request, 
                MultiAgentResponse.class
            );
            System.out.println("DEBUG: Received response status: " + response.getStatusCode());
            System.out.println("DEBUG: Response body: " + response.getBody());

            if (response.getBody() != null && response.getBody().getAnswer() != null) {
                log.info("Received response from Multi-Agent API");
                return response.getBody().getAnswer();
            } else {
                log.warn("Multi-Agent API returned empty response");
                return "Xin lỗi, trợ lý chưa thể trả lời câu hỏi này.";
            }

        } catch (Exception e) {
            log.error("Error calling Multi-Agent API: {}", e.getMessage(), e);
            throw new RuntimeException("Error connecting to the AI service: " + e.getMessage(), e);
        }
    }
}
