package ch.migrosonline.workshop.model;

import java.math.BigDecimal;

public record CartItemResponse(
    Long id, CartItemProductResponse product, Integer quantity, BigDecimal subtotal) {}
