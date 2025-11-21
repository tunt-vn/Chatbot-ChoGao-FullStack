// AnnouncementRequest.java
package com.tuatua.dto;
import lombok.Data;

@Data
public class AnnouncementRequest {
    private String title;
    private String content;
    private boolean visible;
}