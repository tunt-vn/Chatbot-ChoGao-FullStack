package com.tuatua.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "users") // Đổi tên bảng thành "users"
public class User { // Đổi tên class thành "User"

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String googleId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Column(nullable = false)
    private boolean enabled = false;

    private String verificationToken;

    private LocalDateTime tokenExpiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider = AuthProvider.LOCAL;

    // Thêm trường 'role' mới
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    public enum AuthProvider {
        LOCAL,
        GOOGLE
    }

    //dùng để forgot password
    private String passwordResetCode;
    private LocalDateTime resetCodeExpiryDate;
}