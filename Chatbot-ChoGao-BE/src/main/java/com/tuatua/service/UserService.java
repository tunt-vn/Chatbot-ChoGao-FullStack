package com.tuatua.service;

import com.tuatua.dto.RegisterRequest;
import com.tuatua.dto.ResetPasswordRequest;
import com.tuatua.entity.User;
import com.tuatua.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public User registerNewStudent(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email đã được sử dụng.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(User.AuthProvider.LOCAL);
        user.setRole(User.Role.MEMBER);
        user.setEnabled(false);
        user.setVerificationToken(generateVerificationToken());
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));

        return userRepository.save(user);
    }

    @Transactional
    public Optional<User> verifyStudent(String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check if token is expired
            if (user.getVerificationTokenExpiry() != null 
                    && user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
                return Optional.empty();
            }
            
            user.setEnabled(true);
            user.setVerificationToken(null);
            user.setVerificationTokenExpiry(null);
            userRepository.save(user);
            return Optional.of(user);
        }
        
        return Optional.empty();
    }

    @Transactional
    public User resendVerificationToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Email không tồn tại."));
        
        if (user.isEnabled()) {
            throw new IllegalStateException("Tài khoản đã được xác thực.");
        }
        
        user.setVerificationToken(generateVerificationToken());
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        
        return userRepository.save(user);
    }

    @Transactional
    public String generatePasswordResetCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Email không tồn tại trong hệ thống."));
        
        String resetCode = generateResetCode();
        user.setPasswordResetCode(resetCode);
        user.setPasswordResetCodeExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        
        return resetCode;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("Email không tồn tại."));
        
        if (user.getPasswordResetCode() == null 
                || !user.getPasswordResetCode().equals(request.getCode())) {
            throw new IllegalStateException("Mã xác nhận không hợp lệ.");
        }
        
        if (user.getPasswordResetCodeExpiry() != null 
                && user.getPasswordResetCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Mã xác nhận đã hết hạn.");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetCode(null);
        user.setPasswordResetCodeExpiry(null);
        userRepository.save(user);
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }

    private String generateResetCode() {
        // Generate 6-digit code
        return String.format("%06d", (int) (Math.random() * 1000000));
    }
}
