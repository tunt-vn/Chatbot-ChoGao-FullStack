package com.tuatua.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ChatRequest {
    @JsonProperty("chatInput")
    private String chatInput;
    
    @JsonProperty("message")
    private String message;
    
    /**
     * Lấy tin nhắn từ một trong hai field (message hoặc chatInput)
     */
    public String getMessage() {
        return message != null ? message : chatInput;
    }
}
