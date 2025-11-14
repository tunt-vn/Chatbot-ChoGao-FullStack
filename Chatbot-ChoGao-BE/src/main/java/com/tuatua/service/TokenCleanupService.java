package com.tuatua.service;

import com.tuatua.entity.User;
import com.tuatua.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TokenCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(TokenCleanupService.class);
    private final UserRepository userRepository;

    /**
     * Tác vụ định kỳ chạy mỗi giờ để dọn dẹp các token/code đã hết hạn.
     */
    @Scheduled(fixedRate = 3600000) // 3,600,000 mili giây = 1 giờ
    @Transactional
    public void cleanupExpiredTokens() {
        logger.info("Bắt đầu tác vụ định kỳ dọn dẹp token hết hạn...");
        LocalDateTime now = LocalDateTime.now();

        // Dọn dẹp verification tokens hết hạn
        List<User> expiredVerificationAccounts = userRepository.findAllByVerificationTokenIsNotNullAndTokenExpiryDateBefore(now);
        if (!expiredVerificationAccounts.isEmpty()) {
            logger.info("Tìm thấy {} token xác thực hết hạn.", expiredVerificationAccounts.size());
            expiredVerificationAccounts.forEach(student -> {
                student.setVerificationToken(null);
                student.setTokenExpiryDate(null);
            });
            userRepository.saveAll(expiredVerificationAccounts);
        }

        // Dọn dẹp password reset codes hết hạn
        List<User> expiredResetCodeAccounts = userRepository.findAllByPasswordResetCodeIsNotNullAndResetCodeExpiryDateBefore(now);
        if (!expiredResetCodeAccounts.isEmpty()) {
            logger.info("Tìm thấy {} mã reset mật khẩu hết hạn.", expiredResetCodeAccounts.size());
            expiredResetCodeAccounts.forEach(student -> {
                student.setPasswordResetCode(null);
                student.setResetCodeExpiryDate(null);
            });
            userRepository.saveAll(expiredResetCodeAccounts);
        }

        logger.info("Hoàn thành tác vụ dọn dẹp token.");
    }
}