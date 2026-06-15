package com.veha.jewelry.controller;

import com.veha.jewelry.dto.ProductDto;
import com.veha.jewelry.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getWishlist(Authentication authentication) {
        List<ProductDto> wishlist = wishlistService.getWishlist(authentication.getName());
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(Authentication authentication, @RequestParam Long productId) {
        wishlistService.addToWishlist(authentication.getName(), productId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Product added to wishlist");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromWishlist(Authentication authentication, @RequestParam Long productId) {
        wishlistService.removeFromWishlist(authentication.getName(), productId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Product removed from wishlist");
        return ResponseEntity.ok(response);
    }
}
