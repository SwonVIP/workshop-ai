package ch.migrosonline.workshop.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.entity.CartEntity;
import ch.migrosonline.workshop.entity.CartItemEntity;
import ch.migrosonline.workshop.entity.CouponEntity;
import ch.migrosonline.workshop.entity.DeliverySlotEntity;
import ch.migrosonline.workshop.entity.OrderEntity;
import ch.migrosonline.workshop.entity.ProductEntity;
import ch.migrosonline.workshop.mapper.OrderMapper;
import ch.migrosonline.workshop.model.CreateOrderRequest;
import ch.migrosonline.workshop.model.DeliverySlotResponse;
import ch.migrosonline.workshop.model.OrderItemResponse;
import ch.migrosonline.workshop.model.OrderResponse;
import ch.migrosonline.workshop.repository.CartRepository;
import ch.migrosonline.workshop.repository.CouponRepository;
import ch.migrosonline.workshop.repository.DeliverySlotRepository;
import ch.migrosonline.workshop.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

  @Mock private OrderRepository orderRepository;
  @Mock private CartRepository cartRepository;
  @Mock private DeliverySlotRepository deliverySlotRepository;
  @Mock private CouponRepository couponRepository;
  @Mock private OrderMapper orderMapper;

  @InjectMocks private OrderService orderService;

  private static final String SESSION_ID = "test-session-123";

  private CreateOrderRequest validRequest() {
    return new CreateOrderRequest(
        "John",
        "Doe",
        "john@example.com",
        "+41791234567",
        "Bahnhofstrasse 1",
        null,
        "Zurich",
        "8001",
        null,
        1L,
        null);
  }

  private CreateOrderRequest requestWithCoupon(String couponCode) {
    return new CreateOrderRequest(
        "John",
        "Doe",
        "john@example.com",
        "+41791234567",
        "Bahnhofstrasse 1",
        null,
        "Zurich",
        "8001",
        null,
        1L,
        couponCode);
  }

  private DeliverySlotEntity sampleSlot() {
    return DeliverySlotEntity.builder()
        .id(1L)
        .date(LocalDate.now())
        .startTime(LocalTime.of(14, 0))
        .endTime(LocalTime.of(16, 0))
        .price(new BigDecimal("7.90"))
        .build();
  }

  private CartEntity cartWithItems() {
    var product =
        ProductEntity.builder()
            .id(1L)
            .name("Test Product")
            .price(new BigDecimal("25.00"))
            .imageUrl("http://img.jpg")
            .build();
    var cart = CartEntity.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var item = CartItemEntity.builder().id(1L).cart(cart).product(product).quantity(2).build();
    cart.getItems().add(item);
    return cart;
  }

  private OrderResponse sampleOrderResponse(String orderNumber) {
    var slot =
        new DeliverySlotResponse(
            1L, LocalDate.now(), "Today", "14:00", "16:00", new BigDecimal("7.90"));
    var item =
        new OrderItemResponse(
            "Test Product", "http://img.jpg", 2, new BigDecimal("25.00"), new BigDecimal("50.00"));
    return new OrderResponse(
        1L,
        orderNumber,
        "CONFIRMED",
        "John",
        "Doe",
        "john@example.com",
        "+41791234567",
        "Bahnhofstrasse 1",
        null,
        "Zurich",
        "8001",
        null,
        slot,
        List.of(item),
        new BigDecimal("50.00"),
        new BigDecimal("7.90"),
        BigDecimal.ZERO,
        null,
        new BigDecimal("57.90"),
        OffsetDateTime.now());
  }

  @Test
  void orderNumberShouldFitInVarchar20() {
    // given
    var cart = cartWithItems();
    var slot = sampleSlot();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(deliverySlotRepository.findById(1L)).thenReturn(Optional.of(slot));
    when(orderRepository.save(any(OrderEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(orderMapper.toResponse(any())).thenReturn(sampleOrderResponse("ORD-20260306-0001"));

    // when
    orderService.placeOrder(validRequest(), SESSION_ID);

    // then
    var captor = ArgumentCaptor.forClass(OrderEntity.class);
    verify(orderRepository).save(captor.capture());
    var savedOrder = captor.getValue();
    assertThat(savedOrder.getOrderNumber()).hasSizeLessThanOrEqualTo(20);
    assertThat(savedOrder.getOrderNumber()).startsWith("ORD-");
  }

  @Test
  void shouldPlaceOrderSuccessfully() {
    // given
    var cart = cartWithItems();
    var slot = sampleSlot();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(deliverySlotRepository.findById(1L)).thenReturn(Optional.of(slot));
    when(orderRepository.save(any(OrderEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(orderMapper.toResponse(any())).thenReturn(sampleOrderResponse("ORD-20260306-0001"));

    // when
    var result = orderService.placeOrder(validRequest(), SESSION_ID);

    // then
    assertThat(result).isNotNull();
    assertThat(result.status()).isEqualTo("CONFIRMED");

    var captor = ArgumentCaptor.forClass(OrderEntity.class);
    verify(orderRepository).save(captor.capture());
    var savedOrder = captor.getValue();
    assertThat(savedOrder.getSubtotal()).isEqualByComparingTo(new BigDecimal("50.00"));
    assertThat(savedOrder.getDeliveryFee()).isEqualByComparingTo(new BigDecimal("7.90"));
    assertThat(savedOrder.getTotal()).isEqualByComparingTo(new BigDecimal("57.90"));
    assertThat(savedOrder.getItems()).hasSize(1);
  }

  @Test
  void shouldThrowWhenCartNotFound() {
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> orderService.placeOrder(validRequest(), SESSION_ID))
        .isInstanceOf(EntityNotFoundException.class)
        .hasMessageContaining("Cart not found");
  }

  @Test
  void shouldThrowWhenCartIsEmpty() {
    var emptyCart =
        CartEntity.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(emptyCart));

    assertThatThrownBy(() -> orderService.placeOrder(validRequest(), SESSION_ID))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("empty cart");
  }

  @Test
  void shouldThrowWhenDeliverySlotNotFound() {
    var cart = cartWithItems();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(deliverySlotRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> orderService.placeOrder(validRequest(), SESSION_ID))
        .isInstanceOf(EntityNotFoundException.class)
        .hasMessageContaining("Delivery slot not found");
  }

  @Test
  void shouldApplyPercentageCoupon() {
    var cart = cartWithItems();
    var slot = sampleSlot();
    var coupon =
        CouponEntity.builder()
            .code("WELCOME10")
            .type("PERCENTAGE")
            .value(new BigDecimal("10"))
            .active(true)
            .build();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(deliverySlotRepository.findById(1L)).thenReturn(Optional.of(slot));
    when(couponRepository.findByCodeAndActiveTrue("WELCOME10")).thenReturn(Optional.of(coupon));
    when(orderRepository.save(any(OrderEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(orderMapper.toResponse(any())).thenReturn(sampleOrderResponse("ORD-20260306-0001"));

    orderService.placeOrder(requestWithCoupon("WELCOME10"), SESSION_ID);

    var captor = ArgumentCaptor.forClass(OrderEntity.class);
    verify(orderRepository).save(captor.capture());
    var savedOrder = captor.getValue();
    // 10% of 50.00 = 5.00 discount
    assertThat(savedOrder.getDiscount()).isEqualByComparingTo(new BigDecimal("5.00"));
    assertThat(savedOrder.getTotal())
        .isEqualByComparingTo(new BigDecimal("52.90")); // 50 + 7.90 - 5
  }

  @Test
  void shouldApplyFixedAmountCoupon() {
    var cart = cartWithItems();
    var slot = sampleSlot();
    var coupon =
        CouponEntity.builder()
            .code("SAVE5")
            .type("FIXED_AMOUNT")
            .value(new BigDecimal("5"))
            .active(true)
            .build();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(deliverySlotRepository.findById(1L)).thenReturn(Optional.of(slot));
    when(couponRepository.findByCodeAndActiveTrue("SAVE5")).thenReturn(Optional.of(coupon));
    when(orderRepository.save(any(OrderEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(orderMapper.toResponse(any())).thenReturn(sampleOrderResponse("ORD-20260306-0001"));

    orderService.placeOrder(requestWithCoupon("SAVE5"), SESSION_ID);

    var captor = ArgumentCaptor.forClass(OrderEntity.class);
    verify(orderRepository).save(captor.capture());
    var savedOrder = captor.getValue();
    assertThat(savedOrder.getDiscount()).isEqualByComparingTo(new BigDecimal("5.00"));
    assertThat(savedOrder.getTotal()).isEqualByComparingTo(new BigDecimal("52.90"));
  }

  @Test
  void shouldApplyFreeDeliveryCoupon() {
    var cart = cartWithItems(); // subtotal = 50.00, but we need >= 99
    // Override with a higher-value cart
    var product =
        ProductEntity.builder()
            .id(1L)
            .name("Expensive Product")
            .price(new BigDecimal("100.00"))
            .imageUrl("http://img.jpg")
            .build();
    var highValueCart =
        CartEntity.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var item =
        CartItemEntity.builder().id(1L).cart(highValueCart).product(product).quantity(1).build();
    highValueCart.getItems().add(item);

    var slot = sampleSlot();
    var coupon =
        CouponEntity.builder()
            .code("FREE_DELIVERY")
            .type("FREE_DELIVERY")
            .value(BigDecimal.ZERO)
            .active(true)
            .minOrderAmount(new BigDecimal("99"))
            .build();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(highValueCart));
    when(deliverySlotRepository.findById(1L)).thenReturn(Optional.of(slot));
    when(couponRepository.findByCodeAndActiveTrue("FREE_DELIVERY")).thenReturn(Optional.of(coupon));
    when(orderRepository.save(any(OrderEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(orderMapper.toResponse(any())).thenReturn(sampleOrderResponse("ORD-20260306-0001"));

    orderService.placeOrder(requestWithCoupon("FREE_DELIVERY"), SESSION_ID);

    var captor = ArgumentCaptor.forClass(OrderEntity.class);
    verify(orderRepository).save(captor.capture());
    var savedOrder = captor.getValue();
    assertThat(savedOrder.getDeliveryFee()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(savedOrder.getTotal()).isEqualByComparingTo(new BigDecimal("100.00"));
  }

  @Test
  void shouldRejectCouponBelowMinOrderAmount() {
    var cart = cartWithItems(); // subtotal = 50.00
    var slot = sampleSlot();
    var coupon =
        CouponEntity.builder()
            .code("FREE_DELIVERY")
            .type("FREE_DELIVERY")
            .value(BigDecimal.ZERO)
            .active(true)
            .minOrderAmount(new BigDecimal("99"))
            .build();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(deliverySlotRepository.findById(1L)).thenReturn(Optional.of(slot));
    when(couponRepository.findByCodeAndActiveTrue("FREE_DELIVERY")).thenReturn(Optional.of(coupon));

    assertThatThrownBy(
            () -> orderService.placeOrder(requestWithCoupon("FREE_DELIVERY"), SESSION_ID))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("minimum amount");
  }

  @Test
  void shouldThrowWhenCouponNotFound() {
    var cart = cartWithItems();
    var slot = sampleSlot();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(deliverySlotRepository.findById(1L)).thenReturn(Optional.of(slot));
    when(couponRepository.findByCodeAndActiveTrue("INVALID")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> orderService.placeOrder(requestWithCoupon("INVALID"), SESSION_ID))
        .isInstanceOf(EntityNotFoundException.class)
        .hasMessageContaining("Coupon not found");
  }

  @Test
  void shouldClearCartAfterOrderPlacement() {
    var cart = cartWithItems();
    var slot = sampleSlot();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(deliverySlotRepository.findById(1L)).thenReturn(Optional.of(slot));
    when(orderRepository.save(any(OrderEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(orderMapper.toResponse(any())).thenReturn(sampleOrderResponse("ORD-20260306-0001"));

    orderService.placeOrder(validRequest(), SESSION_ID);

    assertThat(cart.getItems()).isEmpty();
    verify(cartRepository).save(cart);
  }

  @Test
  void shouldGetOrderForMatchingSession() {
    var order =
        OrderEntity.builder().id(1L).orderNumber("ORD-20260306-0001").sessionId(SESSION_ID).build();
    when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
    when(orderMapper.toResponse(order)).thenReturn(sampleOrderResponse("ORD-20260306-0001"));

    var result = orderService.getOrder(1L, SESSION_ID);

    assertThat(result.orderNumber()).isEqualTo("ORD-20260306-0001");
  }

  @Test
  void shouldThrowWhenOrderSessionDoesNotMatch() {
    var order =
        OrderEntity.builder()
            .id(1L)
            .orderNumber("ORD-20260306-0001")
            .sessionId("different-session")
            .build();
    when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

    assertThatThrownBy(() -> orderService.getOrder(1L, SESSION_ID))
        .isInstanceOf(EntityNotFoundException.class)
        .hasMessageContaining("Order not found");
  }

  @Test
  void shouldThrowWhenOrderNotFound() {
    when(orderRepository.findById(999L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> orderService.getOrder(999L, SESSION_ID))
        .isInstanceOf(EntityNotFoundException.class)
        .hasMessageContaining("Order not found");
  }
}
