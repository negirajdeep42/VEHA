package com.veha.jewelry.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Shipping address line is required")
    private String shippingAddressLine;

    private String shippingLandmark;

    @NotBlank(message = "Shipping city is required")
    private String shippingCity;

    @NotBlank(message = "Shipping state is required")
    private String shippingState;

    @NotBlank(message = "Shipping pincode is required")
    private String shippingPincode;

    private String shippingCountry = "India";

    @NotBlank(message = "Billing address line is required")
    private String billingAddressLine;

    private String billingLandmark;

    @NotBlank(message = "Billing city is required")
    private String billingCity;

    @NotBlank(message = "Billing state is required")
    private String billingState;

    @NotBlank(message = "Billing pincode is required")
    private String billingPincode;

    private String billingCountry = "India";

    @NotBlank(message = "Payment gateway is required")
    private String paymentGateway; // STRIPE, RAZORPAY, COD

    private String couponCode;
}
