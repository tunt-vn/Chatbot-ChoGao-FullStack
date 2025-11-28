package com.tuatua.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponse {
    private boolean success;
    private String message;
    private String sessionId;
    
    public ChatResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
