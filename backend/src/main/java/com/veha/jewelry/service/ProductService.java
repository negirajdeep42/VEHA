package com.veha.jewelry.service;

import com.veha.jewelry.dto.ProductDto;
import com.veha.jewelry.entity.Category;
import com.veha.jewelry.entity.Product;
import com.veha.jewelry.entity.ProductVariant;
import com.veha.jewelry.exception.ResourceNotFoundException;
import com.veha.jewelry.repository.CategoryRepository;
import com.veha.jewelry.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setCategoryId(product.getCategory().getId());
        dto.setCategoryName(product.getCategory().getName());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setWasPrice(product.getWasPrice());
        dto.setDiscountPercent(product.getDiscountPercent());
        dto.setFeatured(product.isFeatured());
        dto.setBestseller(product.isBestseller());
        dto.setStock(product.getStock());
        dto.setSvgRender(product.getSvgRender());
        
        dto.setImageUrls(product.getImages().stream()
                .map(img -> img.getImageUrl())
                .collect(Collectors.toList()));
        
        dto.setVariants(product.getVariants().stream()
                .map(v -> new ProductDto.ProductVariantDto(v.getId(), v.getVariantType(), v.getVariantValue(), v.getAdditionalPrice()))
                .collect(Collectors.toList()));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts(String category, BigDecimal minPrice, BigDecimal maxPrice, String search, String sort) {
        List<Product> products;
        
        if (search != null && !search.trim().isEmpty()) {
            products = productRepository.searchProducts(search.trim());
        } else if (category != null || minPrice != null || maxPrice != null) {
            products = productRepository.filterProducts(category, minPrice, maxPrice);
        } else {
            products = productRepository.findAll();
        }

        // Apply Sorting
        if (sort != null) {
            switch (sort.toLowerCase()) {
                case "low":
                    products.sort(Comparator.comparing(Product::getPrice));
                    break;
                case "high":
                    products.sort(Comparator.comparing(Product::getPrice).reversed());
                    break;
                case "off":
                    products.sort(Comparator.comparing((Product p) -> p.getDiscountPercent() != null ? p.getDiscountPercent() : 0).reversed());
                    break;
                case "featured":
                default:
                    products.sort(Comparator.comparing(Product::isFeatured).reversed());
                    break;
            }
        }

        return products.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return convertToDto(product);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#slug")
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return convertToDto(product);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDto createProduct(ProductDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        Product product = new Product();
        product.setCategory(category);
        product.setName(dto.getName());
        product.setSlug(dto.getSlug() != null ? dto.getSlug() : dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setWasPrice(dto.getWasPrice());
        product.setDiscountPercent(dto.getDiscountPercent());
        product.setFeatured(dto.isFeatured());
        product.setBestseller(dto.isBestseller());
        product.setStock(dto.getStock());
        product.setSvgRender(dto.getSvgRender());

        if (dto.getVariants() != null) {
            List<ProductVariant> variants = dto.getVariants().stream().map(vd -> {
                ProductVariant v = new ProductVariant();
                v.setProduct(product);
                v.setVariantType(vd.getVariantType());
                v.setVariantValue(vd.getVariantValue());
                v.setAdditionalPrice(vd.getAdditionalPrice() != null ? vd.getAdditionalPrice() : BigDecimal.ZERO);
                return v;
            }).collect(Collectors.toList());
            product.setVariants(variants);
        }

        Product saved = productRepository.save(product);
        return convertToDto(saved);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        product.setCategory(category);
        product.setName(dto.getName());
        product.setSlug(dto.getSlug() != null ? dto.getSlug() : dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setWasPrice(dto.getWasPrice());
        product.setDiscountPercent(dto.getDiscountPercent());
        product.setFeatured(dto.isFeatured());
        product.setBestseller(dto.isBestseller());
        product.setStock(dto.getStock());
        product.setSvgRender(dto.getSvgRender());

        // Update Variants by clearing existing and adding new ones
        product.getVariants().clear();
        if (dto.getVariants() != null) {
            List<ProductVariant> variants = dto.getVariants().stream().map(vd -> {
                ProductVariant v = new ProductVariant();
                v.setProduct(product);
                v.setVariantType(vd.getVariantType());
                v.setVariantValue(vd.getVariantValue());
                v.setAdditionalPrice(vd.getAdditionalPrice() != null ? vd.getAdditionalPrice() : BigDecimal.ZERO);
                return v;
            }).collect(Collectors.toList());
            product.getVariants().addAll(variants);
        }

        Product saved = productRepository.save(product);
        return convertToDto(saved);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}
