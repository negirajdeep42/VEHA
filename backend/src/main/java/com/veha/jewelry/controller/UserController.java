package com.veha.jewelry.controller;

import com.veha.jewelry.dto.ProfileResponse;
import com.veha.jewelry.dto.RegisterRequest;
import com.veha.jewelry.entity.User;
import com.veha.jewelry.exception.ResourceNotFoundException;
import com.veha.jewelry.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/profile")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + authentication.getName()));
        
        ProfileResponse response = new ProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.isVerified()
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(Authentication authentication, @Valid @RequestBody RegisterRequest request) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + authentication.getName()));
        
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        
        User saved = userRepository.save(user);
        
        ProfileResponse response = new ProfileResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getPhone(),
                saved.isVerified()
        );
        return ResponseEntity.ok(response);
    }
}
