package ch.migrosonline.workshop.model;

import java.math.BigDecimal;

public record CartItemProductResponse(Long id, String name, BigDecimal price, String imageUrl) {}
