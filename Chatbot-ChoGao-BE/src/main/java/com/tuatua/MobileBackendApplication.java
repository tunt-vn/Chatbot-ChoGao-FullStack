package com.tuatua;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MobileBackendApplication {
    public static void main(String[] args) {

        // 3. Khởi động Spring Boot
        SpringApplication.run(MobileBackendApplication.class, args);
    }
}