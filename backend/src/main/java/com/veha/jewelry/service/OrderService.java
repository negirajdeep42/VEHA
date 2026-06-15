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
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final PaymentRepository paymentRepository;
    private final CartService cartService;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository,
                        ProductRepository productRepository, UserRepository userRepository,
                        CouponRepository couponRepository, PaymentRepository paymentRepository,
                        CartService cartService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.couponRepository = couponRepository;
        this.paymentRepository = paymentRepository;
        this.cartService = cartService;
    }

    private OrderDto convertToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getUser().getName());
        dto.setCustomerEmail(order.getUser().getEmail());
        
        dto.setShippingAddressLine(order.getShippingAddressLine());
        dto.setShippingLandmark(order.getShippingLandmark());
        dto.setShippingCity(order.getShippingCity());
        dto.setShippingState(order.getShippingState());
        dto.setShippingPincode(order.getShippingPincode());
        dto.setShippingCountry(order.getShippingCountry());

        dto.setBillingAddressLine(order.getBillingAddressLine());
        dto.setBillingLandmark(order.getBillingLandmark());
        dto.setBillingCity(order.getBillingCity());
        dto.setBillingState(order.getBillingState());
        dto.setBillingPincode(order.getBillingPincode());
        dto.setBillingCountry(order.getBillingCountry());

        dto.setSubtotal(order.getSubtotal());
        dto.setDiscount(order.getDiscount());
        dto.setShippingCharge(order.getShippingCharge());
        dto.setTax(order.getTax());
        dto.setTotal(order.getTotal());
        dto.setStatus(order.getStatus());
        dto.setTrackingNumber(order.getTrackingNumber());
        dto.setCouponCode(order.getCouponCode());
        dto.setCreatedAt(order.getCreatedAt());

        dto.setItems(order.getItems().stream()
                .map(item -> new OrderDto.OrderItemDto(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProductName(),
                        item.getVariantInfo(),
                        item.getQuantity(),
                        item.getPriceEach()))
                .collect(Collectors.toList()));

        // Fetch Payment details
        // Assuming OneToOne relation
        if (order.getId() != null) {
            // Since we save payment under order, we can map it if exists
            // Usually payment belongs to order
        }
        return dto;
    }

    private String generateOrderNumber() {
        Random rand = new Random();
        int num = 100000 + rand.nextInt(90000);
        return "VEHA-" + num;
    }

    @Transactional
    public OrderDto placeOrder(String email, CheckoutRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Your shopping cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your shopping cart is empty");
        }

        // Apply Coupon if exists
        BigDecimal couponDiscount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCode(request.getCouponCode().trim().toUpperCase());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                // Validate coupon in service
                // For simplicity, we calculate coupon discount based on code
                if (coupon.isActive() && coupon.getExpiryDate().isAfter(LocalDateTime.now().toLocalDate())) {
                    BigDecimal sub = cart.getItems().stream()
                            .map(item -> item.getPriceEach().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    if (sub.compareTo(coupon.getMinAmount()) >= 0) {
                        if ("PERCENTAGE".equals(coupon.getDiscountType())) {
                            couponDiscount = sub.multiply(coupon.getDiscountValue().divide(new BigDecimal("100.00"), RoundingMode.HALF_UP));
                        } else {
                            couponDiscount = coupon.getDiscountValue();
                        }
                    }
                }
            }
        }

        // Convert cart details to compute final prices
        CartDto cartDto = cartService.convertToDto(cart, couponDiscount);

        // Deduct inventory stock and validate
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                throw new BadRequestException("Item out of stock: " + product.getName() + " (Requested: " + item.getQuantity() + ", Stock: " + product.getStock() + ")");
            }
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }

        // Create Order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        
        order.setShippingAddressLine(request.getShippingAddressLine());
        order.setShippingLandmark(request.getShippingLandmark());
        order.setShippingCity(request.getShippingCity());
        order.setShippingState(request.getShippingState());
        order.setShippingPincode(request.getShippingPincode());
        order.setShippingCountry(request.getShippingCountry());

        order.setBillingAddressLine(request.getBillingAddressLine());
        order.setBillingLandmark(request.getBillingLandmark());
        order.setBillingCity(request.getBillingCity());
        order.setBillingState(request.getBillingState());
        order.setBillingPincode(request.getBillingPincode());
        order.setBillingCountry(request.getBillingCountry());

        order.setSubtotal(cartDto.getSubtotal());
        order.setDiscount(cartDto.getDiscount());
        order.setShippingCharge(cartDto.getShipping());
        order.setTax(cartDto.getTax());
        order.setTotal(cartDto.getTotal());
        order.setCouponCode(request.getCouponCode());
        order.setStatus("CONFIRMED"); // Default status set to confirmed

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setVariantInfo(cartItem.getVariantInfo());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceEach(cartItem.getPriceEach());
            orderItems.add(orderItem);
        }
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Save Payment details
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setPaymentGateway(request.getPaymentGateway());
        payment.setAmount(savedOrder.getTotal());
        if ("COD".equalsIgnoreCase(request.getPaymentGateway())) {
            payment.setPaymentStatus("PENDING");
            payment.setTransactionId("COD-" + System.currentTimeMillis());
        } else {
            payment.setPaymentStatus("PAID"); // Mock paid for online gateways in phase 1
            payment.setTransactionId(request.getPaymentGateway().toUpperCase() + "-" + System.currentTimeMillis());
        }
        paymentRepository.save(payment);

        // Clear cart
        cartService.clearCart(cart);

        OrderDto resultDto = convertToDto(savedOrder);
        OrderDto.PaymentDto payDto = new OrderDto.PaymentDto(
                payment.getPaymentGateway(),
                payment.getTransactionId(),
                payment.getPaymentStatus(),
                payment.getAmount(),
                payment.getCreatedAt()
        );
        resultDto.setPayment(payDto);

        return resultDto;
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getOrderHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderDetails(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or access denied"));
        return convertToDto(order);
    }

    @Transactional(readOnly = true)
    public Order getOrderEntity(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or access denied"));
    }
}
