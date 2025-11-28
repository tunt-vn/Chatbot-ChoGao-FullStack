package com.tuatua.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiAgentRequest {

    @JsonProperty("message")
    private String message;

    @JsonProperty("user_id")
    private String userId;
}