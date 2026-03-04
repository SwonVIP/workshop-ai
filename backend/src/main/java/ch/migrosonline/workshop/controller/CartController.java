package ch.migrosonline.workshop.controller;

import ch.migrosonline.workshop.model.AddToCartRequest;
import ch.migrosonline.workshop.model.CartResponse;
import ch.migrosonline.workshop.model.UpdateCartItemRequest;
import ch.migrosonline.workshop.service.CartService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

  private final CartService cartService;

  private void validateSessionId(String sessionId) {
    try {
      UUID.fromString(sessionId);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid session ID format");
    }
  }

  @GetMapping
  public ResponseEntity<CartResponse> getCart(@RequestHeader("X-Cart-Session") String sessionId) {
    validateSessionId(sessionId);
    return ResponseEntity.ok(cartService.getCart(sessionId));
  }

  @PostMapping("/items")
  public ResponseEntity<CartResponse> addItem(
      @RequestHeader("X-Cart-Session") String sessionId,
      @Valid @RequestBody AddToCartRequest request) {
    validateSessionId(sessionId);
    return ResponseEntity.status(HttpStatus.CREATED).body(cartService.addItem(sessionId, request));
  }

  @PutMapping("/items/{itemId}")
  public ResponseEntity<CartResponse> updateItem(
      @RequestHeader("X-Cart-Session") String sessionId,
      @PathVariable Long itemId,
      @Valid @RequestBody UpdateCartItemRequest request) {
    validateSessionId(sessionId);
    return ResponseEntity.ok(cartService.updateItemQuantity(sessionId, itemId, request));
  }

  @DeleteMapping("/items/{itemId}")
  public ResponseEntity<Void> removeItem(
      @RequestHeader("X-Cart-Session") String sessionId, @PathVariable Long itemId) {
    validateSessionId(sessionId);
    cartService.removeItem(sessionId, itemId);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping
  public ResponseEntity<CartResponse> clearCart(@RequestHeader("X-Cart-Session") String sessionId) {
    validateSessionId(sessionId);
    return ResponseEntity.ok(cartService.clearCart(sessionId));
  }
}
