package com.tuatua.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendVerificationEmail(String toEmail, String token) {
        String verifyUrl = frontendUrl + "/verify-email?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Xác thực tài khoản - Chatbot THPT Chợ Gạo");
        message.setText(
            "Xin chào,\n\n" +
            "Cảm ơn bạn đã đăng ký tài khoản tại Chatbot THPT Chợ Gạo.\n\n" +
            "Vui lòng click vào link sau để xác thực tài khoản của bạn:\n" +
            verifyUrl + "\n\n" +
            "Link này sẽ hết hạn sau 24 giờ.\n\n" +
            "Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.\n\n" +
            "Trân trọng,\n" +
            "Chatbot THPT Chợ Gạo"
        );
        
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String resetCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Đặt lại mật khẩu - Chatbot THPT Chợ Gạo");
        message.setText(
            "Xin chào,\n\n" +
            "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.\n\n" +
            "Mã xác nhận của bạn là: " + resetCode + "\n\n" +
            "Mã này sẽ hết hạn sau 15 phút.\n\n" +
            "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
            "Trân trọng,\n" +
            "Chatbot THPT Chợ Gạo"
        );
        
        mailSender.send(message);
    }
}
