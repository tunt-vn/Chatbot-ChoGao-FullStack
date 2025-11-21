package com.tuatua.repository;
import com.tuatua.entity.ChannelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChannelConfigRepository extends JpaRepository<ChannelConfig, Long> {
    Optional<ChannelConfig> findByPlatform(String platform);
}