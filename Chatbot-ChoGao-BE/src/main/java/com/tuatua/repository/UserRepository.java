package com.tuatua.repository;

import com.tuatua.entity.User; // Thay đổi import từ Student sang User
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> { // Thay đổi Student thành User

    // Các phương thức này giờ sẽ trả về Optional<User> hoặc List<User>
    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationToken(String token);

    List<User> findAllByVerificationTokenIsNotNullAndTokenExpiryDateBefore(LocalDateTime now);

    List<User> findAllByPasswordResetCodeIsNotNullAndResetCodeExpiryDateBefore(LocalDateTime now);

}