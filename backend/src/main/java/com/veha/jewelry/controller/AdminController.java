package com.veha.jewelry.controller;

import com.veha.jewelry.entity.Order;
import com.veha.jewelry.repository.OrderRepository;
import com.veha.jewelry.repository.ProductRepository;
import com.veha.jewelry.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public AdminController(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();

        List<Order> orders = orderRepository.findAll();
        BigDecimal totalSales = orders.stream()
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSales", totalSales);
        stats.put("totalOrders", totalOrders);
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        // Sales trend analysis
        Map<String, Object> salesTrend = new LinkedHashMap<>();
        salesTrend.put("Jan", 120000);
        salesTrend.put("Feb", 150000);
        salesTrend.put("Mar", 180000);
        salesTrend.put("Apr", 220000);
        salesTrend.put("May", 280000);
        salesTrend.put("Jun", 320000); // Mock analytics data based on database products pricing

        // Category popularity counts
        Map<String, Integer> categoryShare = new HashMap<>();
        categoryShare.put("Rings", 45);
        categoryShare.put("Earrings", 25);
        categoryShare.put("Necklaces", 20);
        categoryShare.put("Bracelets", 10);

        Map<String, Object> response = new HashMap<>();
        response.put("salesTrend", salesTrend);
        response.put("categoryShare", categoryShare);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAdminOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status.toUpperCase());
        orderRepository.save(order);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order status updated successfully to " + status);
        return ResponseEntity.ok(response);
    }
}
