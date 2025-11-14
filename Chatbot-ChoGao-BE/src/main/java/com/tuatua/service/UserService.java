package com.tuatua.service;

import com.tuatua.dto.RegisterRequest;
import com.tuatua.dto.ResetPasswordRequest;
import com.tuatua.entity.Role;
import com.tuatua.entity.User;
import com.tuatua.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // THÊM CONSTRUCTOR NÀY VÀO
    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
<<<<<<< HEAD
=======
     * Tạo mã reset mật khẩu cho người dùng.
     * @param email Email của người dùng.
     * @return Mã reset đã được tạo.
     * @throws IllegalStateException nếu email không tồn tại hoặc tài khoản là tài khoản Google.
     */
    public String generatePasswordResetCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy tài khoản với email này."));

        if (user.getProvider() != User.AuthProvider.LOCAL) {
            throw new IllegalStateException("Không thể đặt lại mật khẩu cho tài khoản đăng nhập bằng Google.");
        }

        // Tạo mã ngẫu nhiên 6 chữ số
        String code = String.format("%06d", new SecureRandom().nextInt(999999));

        user.setPasswordResetCode(code);
        user.setResetCodeExpiryDate(LocalDateTime.now().plusMinutes(10)); // Hết hạn sau 10 phút
        userRepository.save(user);

        return code;
    }

    /**
     * Đặt lại mật khẩu cho người dùng nếu mã reset hợp lệ.
     * @param request DTO chứa email, mã, và mật khẩu mới.
     * @throws IllegalStateException nếu thông tin không hợp lệ.
     */
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("Email không hợp lệ."));

        if (user.getPasswordResetCode() == null || !user.getPasswordResetCode().equals(request.getCode())) {
            throw new IllegalStateException("Mã xác thực không chính xác.");
        }

        if (user.getResetCodeExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Mã xác thực đã hết hạn.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        // Dọn dẹp các trường reset
        user.setPasswordResetCode(null);
        user.setResetCodeExpiryDate(null);
        userRepository.save(user);
    }

    /**
>>>>>>> khoi/fear/forgot-password
     * Tạo và gửi lại token xác thực cho một email đã đăng ký nhưng chưa kích hoạt.
     * @param email Email của người dùng.
     * @return Đối tượng Student đã được cập nhật token.
     * @throws IllegalStateException nếu tài khoản không tồn tại hoặc đã được kích hoạt.
     */
    public User resendVerificationToken(String email) {
        // Tìm sinh viên theo email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy tài khoản với email này."));

        // Kiểm tra xem tài khoản đã được kích hoạt chưa
        if (user.isEnabled()) {
            throw new IllegalStateException("Tài khoản này đã được xác thực.");
        }

        // Tạo token mới và cập nhật thời gian hết hạn
        String newToken = UUID.randomUUID().toString();
        user.setVerificationToken(newToken);
        user.setTokenExpiryDate(LocalDateTime.now().plusMinutes(30));

        // Lưu lại vào database
        return userRepository.save(user);
    }

    /**
     * Kiểm tra email đã tồn tại và đăng ký một người dùng mới.
     * @param registerRequest Thông tin đăng ký từ DTO.
     * @return Đối tượng Student đã được tạo.
     * @throws IllegalStateException nếu email đã tồn tại.
     */
    public User registerNewStudent(RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new IllegalStateException("Lỗi: Email đã được sử dụng!");
        }

        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setProvider(User.AuthProvider.LOCAL);
        user.setRole(Role.MEMBER); // Set role mặc định là MEMBER
        user.setEnabled(false); // Mặc định là chưa kích hoạt

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        // Đặt thời gian hết hạn là 30 phút kể từ bây giờ
        user.setTokenExpiryDate(LocalDateTime.now().plusMinutes(30));

        return userRepository.save(user);
    }

    /**
     * Xác thực tài khoản người dùng dựa trên token.
     * @param token Verification token từ email.
     * @return Optional chứa Student đã được xác thực, hoặc trống nếu token không hợp lệ.
     */
    public Optional<User> verifyStudent(String token) {
        Optional<User> studentOpt = userRepository.findByVerificationToken(token);
        // Kiểm tra token có tồn tại VÀ chưa hết hạn
        if (studentOpt.isPresent() && studentOpt.get().getTokenExpiryDate().isAfter(LocalDateTime.now())) {
            User user = studentOpt.get();
            user.setEnabled(true);
            user.setVerificationToken(null); // Xóa token sau khi dùng
            user.setTokenExpiryDate(null); // Xóa luôn thời gian hết hạn
            userRepository.save(user);
            return Optional.of(user);
        }
        return Optional.empty();
    }

    /**
     * Tìm một Student dựa trên email.
     * @param email Email của người dùng.
     * @return Optional chứa Student nếu tìm thấy.
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllStudents() {
        return userRepository.findAll();
    }

    public Optional<User> getStudentById(Long id) {
        return userRepository.findById(id);
    }

    public User createStudent(User user) {
        // Có thể thêm logic kiểm tra dữ liệu trước khi lưu
        return userRepository.save(user);
    }

    public Optional<User> updateStudent(Long id, User userDetails) {
        return userRepository.findById(id)
                .map(existingStudent -> {
                    existingStudent.setName(userDetails.getName());
                    existingStudent.setEmail(userDetails.getEmail());
                    return userRepository.save(existingStudent);
                });
    }

    public boolean deleteStudent(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
}