package com.veha.jewelry.controller;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.veha.jewelry.dto.CartDto;
import com.veha.jewelry.entity.Cart;
import com.veha.jewelry.entity.User;
import com.veha.jewelry.repository.CartRepository;
import com.veha.jewelry.repository.UserRepository;
import com.veha.jewelry.service.CartService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;

    @Value("${stripe.api.key:mock_stripe_key}")
    private String stripeApiKey;

    @Value("${razorpay.key.id:mock_razorpay_key}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:mock_razorpay_secret}")
    private String razorpayKeySecret;

    public PaymentController(UserRepository userRepository, CartRepository cartRepository, CartService cartService) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartService = cartService;
    }

    private BigDecimal getCartTotal(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        CartDto cartDto = cartService.convertToDto(cart, BigDecimal.ZERO);
        return cartDto.getTotal();
    }

    @PostMapping("/stripe/create-payment-intent")
    public ResponseEntity<?> createStripePaymentIntent(Authentication authentication) {
        try {
            Stripe.apiKey = stripeApiKey;
            BigDecimal total = getCartTotal(authentication);
            long amountInPaise = total.multiply(new BigDecimal("100")).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInPaise)
                    .setCurrency("inr")
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", intent.getClientSecret());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<?> createRazorpayOrder(Authentication authentication) {
        try {
            BigDecimal total = getCartTotal(authentication);
            long amountInPaise = total.multiply(new BigDecimal("100")).longValue();

            // If keys are mock, mock the response parameters for local testing stability
            if (razorpayKeyId.startsWith("mock")) {
                Map<String, Object> mockResponse = new HashMap<>();
                mockResponse.put("id", "order_mock_" + System.currentTimeMillis());
                mockResponse.put("amount", amountInPaise);
                mockResponse.put("currency", "INR");
                mockResponse.put("keyId", razorpayKeyId);
                return ResponseEntity.ok(mockResponse);
            }

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("keyId", razorpayKeyId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<?> verifyRazorpayPayment(@RequestBody Map<String, String> payload) {
        try {
            String orderId = payload.get("razorpay_order_id");
            String paymentId = payload.get("razorpay_payment_id");
            String signature = payload.get("razorpay_signature");

            if (razorpayKeyId.startsWith("mock")) {
                Map<String, String> mockResponse = new HashMap<>();
                mockResponse.put("status", "SUCCESS");
                return ResponseEntity.ok(mockResponse);
            }

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isSignatureValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            
            Map<String, String> response = new HashMap<>();
            if (isSignatureValid) {
                response.put("status", "SUCCESS");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "FAILED");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
