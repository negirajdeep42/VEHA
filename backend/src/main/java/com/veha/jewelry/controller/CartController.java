package com.veha.jewelry.controller;

import com.veha.jewelry.dto.CartDto;
import com.veha.jewelry.dto.CartItemRequest;
import com.veha.jewelry.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart(Authentication authentication) {
        CartDto cart = cartService.getCartDto(authentication.getName());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<CartDto> addToCart(Authentication authentication, @Valid @RequestBody CartItemRequest request) {
        CartDto cart = cartService.addToCart(authentication.getName(), request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update")
    public ResponseEntity<CartDto> updateCartItem(
            Authentication authentication,
            @RequestParam Long itemId,
            @RequestParam int quantity) {
        CartDto cart = cartService.updateCartItem(authentication.getName(), itemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<CartDto> removeCartItem(Authentication authentication, @RequestParam Long itemId) {
        CartDto cart = cartService.removeCartItem(authentication.getName(), itemId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/merge")
    public ResponseEntity<CartDto> mergeCart(Authentication authentication, @RequestBody List<CartItemRequest> guestItems) {
        CartDto cart = cartService.mergeCart(authentication.getName(), guestItems);
        return ResponseEntity.ok(cart);
    }
}
