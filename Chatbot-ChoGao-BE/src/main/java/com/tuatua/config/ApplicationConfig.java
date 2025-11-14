package com.tuatua.config;

import com.tuatua.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// Thêm các import này
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List; // Thay Collections bằng List

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            // 1. Tìm kiếm 'User' (thay vì Student)
            com.tuatua.entity.User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

            // 2. Tạo danh sách quyền (authorities) từ 'role' của user
            // Thêm tiền tố "ROLE_" là quy ước để dùng với .hasRole() trong SecurityConfig
            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
            );

            // 3. Trả về đối tượng UserDetails với đầy đủ thông tin
            // Dùng org.springframework.security.core.userdetails.User
            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPassword(),
                    authorities // Cung cấp danh sách quyền
            );
        };
    }
}