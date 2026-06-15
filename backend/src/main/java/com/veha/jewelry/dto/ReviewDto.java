package com.veha.jewelry.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private Long id;
    
    @NotNull(message = "Product ID is required")
    private Long productId;
    
    private String reviewerName;
    
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private int rating;
    
    @NotBlank(message = "Comment is required")
    private String comment;
    
    private LocalDateTime createdAt;
}
