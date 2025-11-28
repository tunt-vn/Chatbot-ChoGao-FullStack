package com.tuatua.controller;

import com.tuatua.dto.*;
import com.tuatua.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // --- ADM-05 ---
    @PutMapping("/channels")
    public ResponseEntity<?> configureChannel(@RequestBody ChannelConfigRequest req) {
        return ResponseEntity.ok(adminService.updateChannelConfig(req));
    }

    // --- ADM-06 ---
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserManagementRequest req) {
        return ResponseEntity.ok(adminService.createUser(req));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserManagementRequest req) {
        return ResponseEntity.ok(adminService.updateUser(id, req));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // --- ADM-07 ---
    @GetMapping("/audit")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAllAuditLogs());
    }

    // --- ADM-08 ---
    @PostMapping("/announcements")
    public ResponseEntity<?> createAnnouncement(@RequestBody AnnouncementRequest req) {
        return ResponseEntity.ok(adminService.createAnnouncement(req));
    }
}