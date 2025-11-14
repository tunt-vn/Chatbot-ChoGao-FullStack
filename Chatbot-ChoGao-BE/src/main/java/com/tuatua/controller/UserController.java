package com.tuatua.controller;

import com.tuatua.entity.User;
import com.tuatua.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class UserController {

    @Autowired
    private UserService userService;

    // API lấy tất cả sinh viên
    @GetMapping
    public List<User> getAllStudents() {
        return userService.getAllStudents();
    }

    // API lấy sinh viên theo ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getStudentById(@PathVariable Long id) {
        return userService.getStudentById(id)
                .map(ResponseEntity::ok) // Nếu tìm thấy, trả về 200 OK
                .orElse(ResponseEntity.notFound().build()); // Nếu không, trả về 404 Not Found
    }

    // API tạo mới sinh viên
    @PostMapping
    public ResponseEntity<User> createStudent(@RequestBody User user) {
        User newUser = userService.createStudent(user);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED); // Trả về 201 Created
    }

    // API cập nhật thông tin sinh viên
    @PutMapping("/{id}")
    public ResponseEntity<User> updateStudent(@PathVariable Long id, @RequestBody User userDetails) {
        return userService.updateStudent(id, userDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API xóa sinh viên
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (userService.deleteStudent(id)) {
            return ResponseEntity.noContent().build(); // Trả về 204 No Content
        }
        return ResponseEntity.notFound().build();
    }
}
