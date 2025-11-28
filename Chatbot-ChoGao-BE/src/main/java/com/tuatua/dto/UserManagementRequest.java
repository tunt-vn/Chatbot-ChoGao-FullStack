// UserManagementRequest.java (Cho ADM-06)
package com.tuatua.dto;
import lombok.Data;

@Data
public class UserManagementRequest {
    private String email;
    private String name;
    private String password; // Chỉ dùng khi tạo mới hoặc reset
    private String role;     // ADMIN, USER...
    private Boolean enabled; // Dùng để khóa/mở khóa
}