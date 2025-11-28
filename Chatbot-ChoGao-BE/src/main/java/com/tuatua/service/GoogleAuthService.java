package com.tuatua.service;

import com.tuatua.entity.User;
import com.tuatua.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${app.google.redirect-uri:http://localhost:5173/auth/google/callback}")
    private String redirectUri;

    public User processUserLogin(String authorizationCode) {
        // 1. Exchange authorization code for access token
        String accessToken = exchangeCodeForToken(authorizationCode);
        
        // 2. Get user info from Google
        Map<String, Object> userInfo = getUserInfo(accessToken);
        
        // 3. Find or create user
        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");
        String picture = (String) userInfo.get("picture");
        String googleId = (String) userInfo.get("sub");
        
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update user info from Google if needed
            if (user.getProvider() == User.AuthProvider.GOOGLE) {
                user.setName(name);
                user.setAvatarUrl(picture);
                return userRepository.save(user);
            }
            return user;
        }
        
        // Create new user
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setName(name);
        newUser.setAvatarUrl(picture);
        newUser.setProvider(User.AuthProvider.GOOGLE);
        newUser.setProviderId(googleId);
        newUser.setRole(User.Role.MEMBER);
        newUser.setEnabled(true); // Google users are auto-verified
        
        return userRepository.save(newUser);
    }

    private String exchangeCodeForToken(String code) {
        String tokenUrl = "https://oauth2.googleapis.com/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
        
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return (String) response.getBody().get("access_token");
        }
        
        throw new RuntimeException("Failed to exchange authorization code for token");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getUserInfo(String accessToken) {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<Void> request = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
                userInfoUrl, 
                HttpMethod.GET, 
                request, 
                Map.class
        );
        
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody();
        }
        
        throw new RuntimeException("Failed to get user info from Google");
    }
}
