package com.veha.jewelry.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private String variantInfo;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
}
