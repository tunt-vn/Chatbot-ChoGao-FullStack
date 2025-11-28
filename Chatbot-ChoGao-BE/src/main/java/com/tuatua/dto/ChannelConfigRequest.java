// ChannelConfigRequest.java
package com.tuatua.dto;
import lombok.Data;

@Data
public class ChannelConfigRequest {
    private String platform;
    private String pageId;
    private String accessToken;
    private String secretKey;
    private boolean active;
}