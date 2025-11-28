package com.tuatua.service;

import com.tuatua.dto.*;
import com.tuatua.entity.*;
import com.tuatua.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ChannelConfigRepository channelRepo;
    private final UserRepository userRepo;
    private final AuditLogRepository auditRepo;
    private final AnnouncementRepository announcementRepo;
    private final PasswordEncoder passwordEncoder;

    // --- ADM-05: Cấu hình Kênh ---
    public ChannelConfig updateChannelConfig(ChannelConfigRequest req) {
        ChannelConfig config = channelRepo.findByPlatform(req.getPlatform())
                .orElse(new ChannelConfig());

        config.setPlatform(req.getPlatform());
        config.setPageId(req.getPageId());
        config.setAccessToken(req.getAccessToken());
        config.setSecretKey(req.getSecretKey());
        config.setActive(req.isActive());

        logActivity("SYSTEM", "UPDATE_CONFIG", req.getPlatform(), "Updated channel config");
        return channelRepo.save(config);
    }

    // --- ADM-06: Quản lý người dùng ---
    public User createUser(UserManagementRequest req) {
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setEmail(req.getEmail());
        user.setName(req.getName());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setProvider(User.AuthProvider.LOCAL);
        user.setEnabled(true);
        // Set Role logic here (tùy implementation Role của bạn)

        logActivity("SUPER_ADMIN", "CREATE_USER", req.getEmail(), "Created new internal user");
        return userRepo.save(user);
    }

    public User updateUser(Long id, UserManagementRequest req) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getEnabled() != null) user.setEnabled(req.getEnabled()); // Lock/Unlock
        if (req.getPassword() != null && !req.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(req.getPassword())); // Reset Password
        }
        // Update other fields...

        logActivity("SUPER_ADMIN", "UPDATE_USER", user.getEmail(), "Updated user status/info");
        return userRepo.save(user);
    }

    public void deleteUser(Long id) {
        userRepo.deleteById(id);
        logActivity("SUPER_ADMIN", "DELETE_USER", "ID: " + id, "Deleted user");
    }

    // --- ADM-07: Nhật ký hoạt động ---
    public List<AuditLog> getAllAuditLogs() {
        return auditRepo.findAll();
    }

    private void logActivity(String actor, String action, String target, String details) {
        AuditLog log = new AuditLog();
        log.setPerformedBy(actor);
        log.setAction(action);
        log.setTarget(target);
        log.setDetails(details);
        auditRepo.save(log);
    }

    // --- ADM-08: Thông báo hệ thống ---
    public Announcement createAnnouncement(AnnouncementRequest req) {
        Announcement a = new Announcement();
        a.setTitle(req.getTitle());
        a.setContent(req.getContent());
        a.setVisible(req.isVisible());
        return announcementRepo.save(a);
    }

    // Các hàm update/delete announcement tương tự...
}