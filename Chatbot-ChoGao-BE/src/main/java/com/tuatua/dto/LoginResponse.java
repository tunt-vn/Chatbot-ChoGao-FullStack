package com.tuatua.dto;

import com.tuatua.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    
    private String token;
    private UserInfo user;
    
    public LoginResponse(String token, User user) {
        this.token = token;
        this.user = new UserInfo(user);
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String avatarUrl;
        private String role;
        
        public UserInfo(User user) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.avatarUrl = user.getAvatarUrl();
            this.role = user.getRole().name();
        }
    }
}
