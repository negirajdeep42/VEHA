package com.veha.jewelry.service;

import com.veha.jewelry.dto.*;
import com.veha.jewelry.entity.*;
import com.veha.jewelry.exception.BadRequestException;
import com.veha.jewelry.exception.ResourceNotFoundException;
import com.veha.jewelry.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("999.00");
    private static final BigDecimal FLAT_SHIPPING_CHARGE = new BigDecimal("49.00");
    private static final BigDecimal GST_RATE = new BigDecimal("0.03"); // 3% GST on Jewelry

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    private BigDecimal getProductVariantPrice(Product product, String variantInfo) {
        BigDecimal basePrice = product.getPrice();
        if (variantInfo == null || variantInfo.trim().isEmpty()) {
            return basePrice;
        }

        // Calculate if any variant has additional price
        BigDecimal additional = BigDecimal.ZERO;
        for (ProductVariant variant : product.getVariants()) {
            if (variantInfo.toLowerCase().contains(variant.getVariantValue().toLowerCase())) {
                additional = additional.add(variant.getAdditionalPrice());
            }
        }
        return basePrice.add(additional);
    }

    public CartDto convertToDto(Cart cart, BigDecimal discount) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<CartDto.CartItemDto> itemDtos = new ArrayList<>();

        for (CartItem item : cart.getItems()) {
            CartDto.CartItemDto itemDto = new CartDto.CartItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setProductSlug(item.getProduct().getSlug());
            itemDto.setVariantInfo(item.getVariantInfo());
            itemDto.setQuantity(item.getQuantity());
            
            BigDecimal priceEach = getProductVariantPrice(item.getProduct(), item.getVariantInfo());
            itemDto.setPriceEach(priceEach);
            
            BigDecimal totalItemPrice = priceEach.multiply(BigDecimal.valueOf(item.getQuantity()));
            itemDto.setPriceTotal(totalItemPrice);
            itemDto.setSvgRender(item.getProduct().getSvgRender());
            
            subtotal = subtotal.add(totalItemPrice);
            itemDtos.add(itemDto);
        }

        dto.setItems(itemDtos);
        dto.setSubtotal(subtotal);
        dto.setDiscount(discount != null ? discount : BigDecimal.ZERO);

        // Tax Calculation (3% GST)
        BigDecimal taxableAmount = subtotal.subtract(dto.getDiscount());
        if (taxableAmount.compareTo(BigDecimal.ZERO) < 0) {
            taxableAmount = BigDecimal.ZERO;
        }
        BigDecimal tax = taxableAmount.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
        dto.setTax(tax);

        // Shipping Calculation (Free above 999)
        BigDecimal shipping = BigDecimal.ZERO;
        if (subtotal.compareTo(BigDecimal.ZERO) > 0 && taxableAmount.compareTo(FREE_SHIPPING_THRESHOLD) < 0) {
            shipping = FLAT_SHIPPING_CHARGE;
        }
        dto.setShipping(shipping);

        // Total
        dto.setTotal(taxableAmount.add(tax).add(shipping).setScale(2, RoundingMode.HALF_UP));
        return dto;
    }

    @Transactional(readOnly = true)
    public CartDto getCartDto(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Cart cart = getOrCreateCart(user);
        return convertToDto(cart, BigDecimal.ZERO);
    }

    @Transactional
    public CartDto addToCart(String email, CartItemRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Not enough stock available. Remaining stock: " + product.getStock());
        }

        // Check if item already in cart with same variants
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()) &&
                                (item.getVariantInfo() == null && request.getVariantInfo() == null ||
                                 item.getVariantInfo() != null && item.getVariantInfo().equals(request.getVariantInfo())))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (product.getStock() < newQty) {
                throw new BadRequestException("Not enough stock available.");
            }
            item.setQuantity(newQty);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setVariantInfo(request.getVariantInfo());
            item.setQuantity(request.getQuantity());
            item.setPriceEach(getProductVariantPrice(product, request.getVariantInfo()));
            cart.getItems().add(item);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        Cart saved = cartRepository.save(cart);
        return convertToDto(saved, BigDecimal.ZERO);
    }

    @Transactional
    public CartDto updateCartItem(String email, Long itemId, int quantity) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Cart cart = getOrCreateCart(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found in your cart"));

        if (item.getProduct().getStock() < quantity) {
            throw new BadRequestException("Not enough stock available.");
        }

        item.setQuantity(quantity);
        cart.setUpdatedAt(LocalDateTime.now());
        Cart saved = cartRepository.save(cart);
        return convertToDto(saved, BigDecimal.ZERO);
    }

    @Transactional
    public CartDto removeCartItem(String email, Long itemId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Cart cart = getOrCreateCart(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found in your cart"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        
        cart.setUpdatedAt(LocalDateTime.now());
        Cart saved = cartRepository.save(cart);
        return convertToDto(saved, BigDecimal.ZERO);
    }

    @Transactional
    public void clearCart(Cart cart) {
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Transactional
    public CartDto mergeCart(String email, List<CartItemRequest> guestItems) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Cart cart = getOrCreateCart(user);

        for (CartItemRequest request : guestItems) {
            Product product = productRepository.findById(request.getProductId()).orElse(null);
            if (product == null) continue;

            Optional<CartItem> existingItem = cart.getItems().stream()
                    .filter(item -> item.getProduct().getId().equals(product.getId()) &&
                                    (item.getVariantInfo() == null && request.getVariantInfo() == null ||
                                     item.getVariantInfo() != null && item.getVariantInfo().equals(request.getVariantInfo())))
                    .findFirst();

            int targetQty = request.getQuantity();
            if (existingItem.isPresent()) {
                CartItem item = existingItem.get();
                item.setQuantity(Math.min(product.getStock(), item.getQuantity() + targetQty));
            } else {
                CartItem item = new CartItem();
                item.setCart(cart);
                item.setProduct(product);
                item.setVariantInfo(request.getVariantInfo());
                item.setQuantity(Math.min(product.getStock(), targetQty));
                item.setPriceEach(getProductVariantPrice(product, request.getVariantInfo()));
                cart.getItems().add(item);
            }
        }

        cart.setUpdatedAt(LocalDateTime.now());
        Cart saved = cartRepository.save(cart);
        return convertToDto(saved, BigDecimal.ZERO);
    }
}
