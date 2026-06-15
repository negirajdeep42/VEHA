package com.veha.jewelry.controller;

import com.veha.jewelry.dto.ContactMessageDto;
import com.veha.jewelry.entity.ContactMessage;
import com.veha.jewelry.repository.ContactMessageRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageRepository contactMessageRepository;

    public ContactController(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @PostMapping
    public ResponseEntity<?> submitContactMessage(@Valid @RequestBody ContactMessageDto dto) {
        ContactMessage msg = new ContactMessage();
        msg.setName(dto.getName());
        msg.setEmail(dto.getEmail());
        msg.setSubject(dto.getSubject());
        msg.setMessage(dto.getMessage());
        
        contactMessageRepository.save(msg);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Thank you! Your message has been sent successfully.");
        return ResponseEntity.ok(response);
    }
}
