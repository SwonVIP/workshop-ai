package ch.migrosonline.workshop.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderResponse(
    Long id,
    String orderNumber,
    String status,
    String firstName,
    String lastName,
    String email,
    String phone,
    String street,
    String apartment,
    String city,
    String postalCode,
    String deliveryInstructions,
    DeliverySlotResponse deliverySlot,
    List<OrderItemResponse> items,
    BigDecimal subtotal,
    BigDecimal deliveryFee,
    BigDecimal discount,
    String couponCode,
    BigDecimal total,
    OffsetDateTime createdAt) {}
