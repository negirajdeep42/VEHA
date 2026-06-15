package com.veha.jewelry.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    
    private String shippingAddressLine;
    private String shippingLandmark;
    private String shippingCity;
    private String shippingState;
    private String shippingPincode;
    private String shippingCountry;

    private String billingAddressLine;
    private String billingLandmark;
    private String billingCity;
    private String billingState;
    private String billingPincode;
    private String billingCountry;

    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal shippingCharge;
    private BigDecimal tax;
    private BigDecimal total;
    private String status;
    private String trackingNumber;
    private String couponCode;
    private LocalDateTime createdAt;
    
    private List<OrderItemDto> items;
    private PaymentDto payment;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long id;
        private Long productId;
        private String productName;
        private String variantInfo;
        private int quantity;
        private BigDecimal priceEach;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDto {
        private String paymentGateway;
        private String transactionId;
        private String paymentStatus;
        private BigDecimal amount;
        private LocalDateTime createdAt;
    }
}
