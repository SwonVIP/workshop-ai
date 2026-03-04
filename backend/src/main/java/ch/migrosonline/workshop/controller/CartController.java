package ch.migrosonline.workshop.controller;

import ch.migrosonline.workshop.model.AddToCartRequest;
import ch.migrosonline.workshop.model.CartResponse;
import ch.migrosonline.workshop.model.UpdateCartItemRequest;
import ch.migrosonline.workshop.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Validated
public class CartController {

  private final CartService cartService;

  @GetMapping
  public ResponseEntity<CartResponse> getCart(
      @RequestHeader("X-CartEntity-Session") @UUID String sessionId) {
    return ResponseEntity.ok(cartService.getCart(sessionId));
  }

  @PostMapping("/items")
  public ResponseEntity<CartResponse> addItem(
      @RequestHeader("X-CartEntity-Session") @UUID String sessionId,
      @Valid @RequestBody AddToCartRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(cartService.addItem(sessionId, request));
  }

  @PutMapping("/items/{itemId}")
  public ResponseEntity<CartResponse> updateItem(
      @RequestHeader("X-CartEntity-Session") @UUID String sessionId,
      @PathVariable Long itemId,
      @Valid @RequestBody UpdateCartItemRequest request) {
    return ResponseEntity.ok(cartService.updateItemQuantity(sessionId, itemId, request));
  }

  @DeleteMapping("/items/{itemId}")
  public ResponseEntity<Void> removeItem(
      @RequestHeader("X-CartEntity-Session") @UUID String sessionId, @PathVariable Long itemId) {
    cartService.removeItem(sessionId, itemId);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping
  public ResponseEntity<CartResponse> clearCart(
      @RequestHeader("X-CartEntity-Session") @UUID String sessionId) {
    return ResponseEntity.ok(cartService.clearCart(sessionId));
  }
}
