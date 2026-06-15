package com.veha.jewelry.controller;

import com.veha.jewelry.dto.CheckoutRequest;
import com.veha.jewelry.dto.OrderDto;
import com.veha.jewelry.entity.Order;
import com.veha.jewelry.service.OrderService;
import com.veha.jewelry.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;

    public OrderController(OrderService orderService, InvoiceService invoiceService) {
        this.orderService = orderService;
        this.invoiceService = invoiceService;
    }

    @PostMapping
    public ResponseEntity<OrderDto> placeOrder(Authentication authentication, @Valid @RequestBody CheckoutRequest request) {
        OrderDto order = orderService.placeOrder(authentication.getName(), request);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getOrderHistory(Authentication authentication) {
        List<OrderDto> orders = orderService.getOrderHistory(authentication.getName());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderDetails(Authentication authentication, @PathVariable Long id) {
        OrderDto order = orderService.getOrderDetails(authentication.getName(), id);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<InputStreamResource> downloadInvoice(Authentication authentication, @PathVariable Long id) {
        Order order = orderService.getOrderEntity(authentication.getName(), id);
        ByteArrayInputStream bis = invoiceService.generateInvoicePdf(order);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=invoice-" + order.getOrderNumber() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
