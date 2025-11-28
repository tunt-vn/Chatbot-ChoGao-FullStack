package com.tuatua.repository;

import com.tuatua.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByVerificationToken(String token);
    
    Optional<User> findByPasswordResetCode(String code);
    
    boolean existsByEmail(String email);
}
