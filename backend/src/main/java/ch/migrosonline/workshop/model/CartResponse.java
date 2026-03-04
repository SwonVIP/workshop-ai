package ch.migrosonline.workshop.model;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
    Long id,
    String sessionId,
    List<CartItemResponse> items,
    Integer totalItems,
    BigDecimal totalPrice) {}
