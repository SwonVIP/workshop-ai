package ch.migrosonline.workshop.service;

import ch.migrosonline.workshop.entity.OrderEntity;
import ch.migrosonline.workshop.entity.OrderItemEntity;
import ch.migrosonline.workshop.mapper.OrderMapper;
import ch.migrosonline.workshop.model.CreateOrderRequest;
import ch.migrosonline.workshop.model.OrderResponse;
import ch.migrosonline.workshop.repository.CartRepository;
import ch.migrosonline.workshop.repository.CouponRepository;
import ch.migrosonline.workshop.repository.DeliverySlotRepository;
import ch.migrosonline.workshop.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {

  private final OrderRepository orderRepository;
  private final CartRepository cartRepository;
  private final DeliverySlotRepository deliverySlotRepository;
  private final CouponRepository couponRepository;
  private final OrderMapper orderMapper;

  @Transactional
  public OrderResponse placeOrder(CreateOrderRequest request, String sessionId) {
    // Validate cart
    var cart =
        cartRepository
            .findBySessionId(sessionId)
            .orElseThrow(
                () -> new EntityNotFoundException("Cart not found for session: " + sessionId));

    if (cart.getItems().isEmpty()) {
      throw new IllegalArgumentException("Cannot place order with empty cart");
    }

    // Validate delivery slot
    var slot =
        deliverySlotRepository
            .findById(request.deliverySlotId())
            .orElseThrow(
                () ->
                    new EntityNotFoundException(
                        "Delivery slot not found: " + request.deliverySlotId()));

    // Calculate subtotal from cart
    var subtotal =
        cart.getItems().stream()
            .map(
                item ->
                    item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    // Calculate discount if coupon provided
    var discount = BigDecimal.ZERO;
    var deliveryFee = slot.getPrice();
    String appliedCouponCode = request.couponCode();
    if (appliedCouponCode != null && !appliedCouponCode.isBlank()) {
      var coupon =
          couponRepository
              .findByCodeAndActiveTrue(appliedCouponCode)
              .orElseThrow(
                  () ->
                      new EntityNotFoundException(
                          "Coupon not found or inactive: " + appliedCouponCode));

      // Enforce minimum order amount
      if (coupon.getMinOrderAmount() != null
          && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
        throw new IllegalArgumentException(
            "Order does not meet minimum amount of CHF "
                + coupon.getMinOrderAmount()
                + " for coupon "
                + appliedCouponCode);
      }

      if ("FREE_DELIVERY".equals(coupon.getType())) {
        deliveryFee = BigDecimal.ZERO;
      } else {
        discount =
            switch (coupon.getType()) {
              case "PERCENTAGE" ->
                  subtotal
                      .multiply(coupon.getValue())
                      .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
              case "FIXED_AMOUNT" -> coupon.getValue().min(subtotal);
              default -> BigDecimal.ZERO;
            };
      }
    }

    var total = subtotal.add(deliveryFee).subtract(discount);

    // Generate order number using UUID suffix to avoid race conditions
    // Format: ORD-YYYYMMDD-XXXXXXX (4 + 8 + 1 + 7 = 20 chars, fits VARCHAR(20))
    var orderNumber =
        "ORD-"
            + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
            + "-"
            + UUID.randomUUID().toString().substring(0, 7).toUpperCase();

    // Build order
    var order =
        OrderEntity.builder()
            .orderNumber(orderNumber)
            .sessionId(sessionId)
            .status("CONFIRMED")
            .firstName(request.firstName())
            .lastName(request.lastName())
            .email(request.email())
            .phone(request.phone())
            .street(request.street())
            .apartment(request.apartment())
            .city(request.city())
            .postalCode(request.postalCode())
            .deliveryInstructions(request.deliveryInstructions())
            .deliverySlot(slot)
            .couponCode(appliedCouponCode)
            .subtotal(subtotal)
            .deliveryFee(deliveryFee)
            .discount(discount)
            .total(total)
            .items(new ArrayList<>())
            .build();

    // Snapshot cart items
    cart.getItems()
        .forEach(
            cartItem -> {
              var product = cartItem.getProduct();
              var lineTotal =
                  product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
              var orderItem =
                  OrderItemEntity.builder()
                      .order(order)
                      .productName(product.getName())
                      .imageUrl(product.getImageUrl())
                      .quantity(cartItem.getQuantity())
                      .unitPrice(product.getPrice())
                      .subtotal(lineTotal)
                      .build();
              order.getItems().add(orderItem);
            });

    var savedOrder = orderRepository.save(order);

    // Clear cart after order
    cart.getItems().clear();
    cartRepository.save(cart);

    return orderMapper.toResponse(savedOrder);
  }

  @Transactional(readOnly = true)
  public OrderResponse getOrder(Long id, String sessionId) {
    var order =
        orderRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));

    if (!order.getSessionId().equals(sessionId)) {
      throw new EntityNotFoundException("Order not found: " + id);
    }

    return orderMapper.toResponse(order);
  }
}
