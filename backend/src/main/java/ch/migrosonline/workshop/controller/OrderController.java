package ch.migrosonline.workshop.controller;

import ch.migrosonline.workshop.model.CreateOrderRequest;
import ch.migrosonline.workshop.model.OrderResponse;
import ch.migrosonline.workshop.service.OrderService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public OrderResponse placeOrder(
      @RequestHeader("X-CartEntity-Session") UUID sessionId,
      @Valid @RequestBody CreateOrderRequest request) {
    return orderService.placeOrder(request, sessionId.toString());
  }

  @GetMapping("/{id}")
  public OrderResponse getOrder(
      @RequestHeader("X-CartEntity-Session") UUID sessionId, @PathVariable Long id) {
    return orderService.getOrder(id, sessionId.toString());
  }
}
