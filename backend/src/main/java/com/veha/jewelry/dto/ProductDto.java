package com.veha.jewelry.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal wasPrice;
    private Integer discountPercent;
    private boolean featured;
    private boolean bestseller;
    private int stock;
    private String svgRender;
    private List<String> imageUrls;
    private List<ProductVariantDto> variants;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductVariantDto {
        private Long id;
        private String variantType;
        private String variantValue;
        private BigDecimal additionalPrice;
    }
}
