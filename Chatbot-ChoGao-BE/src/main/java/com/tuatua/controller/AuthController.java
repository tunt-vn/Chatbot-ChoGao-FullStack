package com.tuatua.controller;

import com.tuatua.dto.*;
import com.tuatua.entity.User;
import com.tuatua.service.EmailService;
import com.tuatua.service.GoogleAuthService;
import com.tuatua.service.JwtService;
import com.tuatua.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private GoogleAuthService googleAuthService;

    @Autowired
    private JwtService jwtService;

    /**
     * Endpoint để yêu cầu mã reset mật khẩu.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        try {
            String resetCode = userService.generatePasswordResetCode(request.getEmail());
            try {
                emailService.sendPasswordResetEmail(request.getEmail(), resetCode);
            } catch (Exception e) {
                // Log email error but don't fail password reset
                System.err.println("Email send failed: " + e.getMessage());
            }
            return ResponseEntity.ok(new ApiResponse(true, "Mã đặt lại mật khẩu đã được gửi đến email của bạn."));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Endpoint để đặt lại mật khẩu mới.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        try {
            userService.resetPassword(request);
            return ResponseEntity.ok(new ApiResponse(true, "Đặt lại mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu mới."));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Endpoint để người dùng yêu cầu gửi lại email xác thực.
     */
    @PostMapping("/resend-verify-mail")
    public ResponseEntity<?> resendVerification(@RequestBody @Valid ResendTokenRequest request) {
        try {
            User updatedUser = userService.resendVerificationToken(request.getEmail());
            try {
                emailService.sendVerificationEmail(updatedUser.getEmail(), updatedUser.getVerificationToken());
            } catch (Exception e) {
                // Log email error but don't fail resend
                System.err.println("Email send failed: " + e.getMessage());
            }
            return ResponseEntity.ok(new ApiResponse(true, "Một email xác thực mới đã được gửi. Vui lòng kiểm tra hòm thư của bạn."));
        } catch (IllegalStateException e) {
            // Trả về lỗi nếu email không tồn tại hoặc tài khoản đã được kích hoạt
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Endpoint để người dùng đăng ký tài khoản mới
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            User newUser = userService.registerNewStudent(registerRequest);
            try {
                emailService.sendVerificationEmail(newUser.getEmail(), newUser.getVerificationToken());
            } catch (Exception e) {
                // Log email error but don't fail registration
                System.err.println("Email send failed: " + e.getMessage());
            }
            return ResponseEntity.ok(new ApiResponse(true, "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }


    /**
     * Endpoint xác nhận việc đăng ký của người dùng bằng cách gửi mail
     */

    @GetMapping("/verify-mail")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        Optional<User> studentOpt = userService.verifyStudent(token);
        if (studentOpt.isPresent()) {
            return ResponseEntity.ok(new ApiResponse(true, "Xác thực tài khoản thành công! Bây giờ bạn có thể đăng nhập."));
        } else {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Token không hợp lệ hoặc đã hết hạn."));
        }
    }

    /**
     * Alias endpoint cho verify-mail (dùng cho frontend redirect)
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccountAlias(@RequestParam("token") String token) {
        return verifyAccount(token);
    }

    /*
    xác nhận việc đăng ký của người dùng sau đó chuyển hướng đến app

    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        Optional<Student> studentOpt = studentService.verifyStudent(token);

        // Cấu hình URL của frontend
        String frontendUrl = "http://localhost:3000"; // Hoặc URL trang web của bạn

        if (studentOpt.isPresent()) {
            // Chuyển hướng đến trang thành công
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(frontendUrl + "/verification-success"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND); // Mã 302 FOUND
        } else {
            // Chuyển hướng đến trang thất bại
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(frontendUrl + "/verification-failure"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }
     */

    /**
     * Endpoint đăng nhập bằng account local
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> studentOpt = userService.findByEmail(loginRequest.getEmail());
        if (studentOpt.isEmpty()) { // || !studentOpt.get().isEnabled()) {
            return ResponseEntity.status(401).body("Tài khoản không tồn tại."); // hoặc chưa được xác thực.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = studentOpt.get();
        String jwt = jwtService.generateToken(user);
        LoginResponse response = new LoginResponse(jwt, user);

        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint đăng nhập bằng google
     */
    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        try {
            // 1. Xác thực người dùng và lưu vào DB (giữ nguyên)
            User user = googleAuthService.processUserLogin(request.getCode());

            // 2. Tạo JWT từ thông tin người dùng
            String token = jwtService.generateToken(user);

            // 3. Trả về token và thông tin người dùng cho frontend
            LoginResponse response = new LoginResponse(token, user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // In lỗi ra console để debug
            return ResponseEntity.badRequest().body("Error during Google authentication: " + e.getMessage());
        }
    }

    /**
     * Endpoint test lấy verification token của user (dùng để test)
     */
    @GetMapping("/test/get-verification-token")
    public ResponseEntity<?> getVerificationToken(@RequestParam("email") String email) {
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(new ApiResponse(true, "Token: " + userOpt.get().getVerificationToken()));
        } else {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Email không tồn tại"));
        }
    }
}
