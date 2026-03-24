package ch.migrosonline.workshop.model;

import java.math.BigDecimal;

public record OrderItemResponse(
    String productName,
    String imageUrl,
    Integer quantity,
    BigDecimal unitPrice,
    BigDecimal subtotal) {}
