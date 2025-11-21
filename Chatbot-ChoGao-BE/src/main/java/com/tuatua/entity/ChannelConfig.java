package com.tuatua.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "channel_configs")
public class ChannelConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String platform; // Ví dụ: "FACEBOOK", "ZALO"

    private String pageId;
    private String accessToken;
    private String secretKey;
    private boolean isActive;
}