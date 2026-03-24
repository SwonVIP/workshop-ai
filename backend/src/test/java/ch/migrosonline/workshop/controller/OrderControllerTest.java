package ch.migrosonline.workshop.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.model.DeliverySlotResponse;
import ch.migrosonline.workshop.model.OrderItemResponse;
import ch.migrosonline.workshop.model.OrderResponse;
import ch.migrosonline.workshop.service.OrderService;
import ch.migrosonline.workshop.support.ControllerTestSupport;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(OrderController.class)
class OrderControllerTest extends ControllerTestSupport {

  @MockitoBean private OrderService orderService;

  private static final String SESSION_ID = "550e8400-e29b-41d4-a716-446655440000";
  private static final String SESSION_HEADER = "X-CartEntity-Session";

  private OrderResponse sampleOrderResponse() {
    var slot =
        new DeliverySlotResponse(
            1L, LocalDate.now(), "Today", "14:00", "16:00", new BigDecimal("7.90"));
    var item =
        new OrderItemResponse(
            "Test Product", "http://img.jpg", 2, new BigDecimal("10.00"), new BigDecimal("20.00"));
    return new OrderResponse(
        1L,
        "ORD-20260306-0001",
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
        new BigDecimal("20.00"),
        new BigDecimal("7.90"),
        BigDecimal.ZERO,
        null,
        new BigDecimal("27.90"),
        OffsetDateTime.now());
  }

  @Test
  void shouldPlaceOrderAndReturn201() {
    when(orderService.placeOrder(any(), eq(SESSION_ID))).thenReturn(sampleOrderResponse());

    var result =
        mvc.post()
            .uri("/api/orders")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "firstName": "John",
                  "lastName": "Doe",
                  "email": "john@example.com",
                  "phone": "+41791234567",
                  "street": "Bahnhofstrasse 1",
                  "city": "Zurich",
                  "postalCode": "8001",
                  "deliverySlotId": 1
                }
                """)
            .exchange();

    assertThat(result).hasStatus(201);
    assertThat(result).bodyJson().extractingPath("orderNumber").isEqualTo("ORD-20260306-0001");
    assertThat(result).bodyJson().extractingPath("status").isEqualTo("CONFIRMED");
  }

  @Test
  void shouldReturn400WhenRequiredFieldsMissing() {
    var result =
        mvc.post()
            .uri("/api/orders")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}")
            .exchange();

    assertThat(result).hasStatus(400);
  }

  @Test
  void shouldReturn404WhenCartNotFound() {
    when(orderService.placeOrder(any(), eq(SESSION_ID)))
        .thenThrow(new EntityNotFoundException("Cart not found"));

    var result =
        mvc.post()
            .uri("/api/orders")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "firstName": "John",
                  "lastName": "Doe",
                  "email": "john@example.com",
                  "phone": "+41791234567",
                  "street": "Bahnhofstrasse 1",
                  "city": "Zurich",
                  "postalCode": "8001",
                  "deliverySlotId": 1
                }
                """)
            .exchange();

    assertThat(result).hasStatus(404);
  }

  @Test
  void shouldGetOrderById() {
    when(orderService.getOrder(1L, SESSION_ID)).thenReturn(sampleOrderResponse());

    var result = mvc.get().uri("/api/orders/1").header(SESSION_HEADER, SESSION_ID).exchange();

    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("orderNumber").isEqualTo("ORD-20260306-0001");
  }

  @Test
  void shouldReturn404WhenOrderNotFound() {
    when(orderService.getOrder(999L, SESSION_ID))
        .thenThrow(new EntityNotFoundException("Order not found: 999"));

    var result = mvc.get().uri("/api/orders/999").header(SESSION_HEADER, SESSION_ID).exchange();

    assertThat(result).hasStatus(404);
  }
}
