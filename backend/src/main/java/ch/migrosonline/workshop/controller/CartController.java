package ch.migrosonline.workshop.controller;

import ch.migrosonline.workshop.model.AddToCartRequest;
import ch.migrosonline.workshop.model.CartResponse;
import ch.migrosonline.workshop.model.UpdateCartItemRequest;
import ch.migrosonline.workshop.service.CartService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

  private final CartService cartService;

  @GetMapping
  public CartResponse getCart(@RequestHeader("X-CartEntity-Session") UUID sessionId) {
    return cartService.getCart(sessionId.toString());
  }

  @PostMapping("/items")
  @ResponseStatus(HttpStatus.CREATED)
  public CartResponse addItem(
      @RequestHeader("X-CartEntity-Session") UUID sessionId,
      @Valid @RequestBody AddToCartRequest request) {
    return cartService.addItem(sessionId.toString(), request);
  }

  @PutMapping("/items/{itemId}")
  public CartResponse updateItem(
      @RequestHeader("X-CartEntity-Session") UUID sessionId,
      @PathVariable Long itemId,
      @Valid @RequestBody UpdateCartItemRequest request) {
    return cartService.updateItemQuantity(sessionId.toString(), itemId, request);
  }

  @DeleteMapping("/items/{itemId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void removeItem(
      @RequestHeader("X-CartEntity-Session") UUID sessionId, @PathVariable Long itemId) {
    cartService.removeItem(sessionId.toString(), itemId);
  }

  @DeleteMapping
  public CartResponse clearCart(@RequestHeader("X-CartEntity-Session") UUID sessionId) {
    return cartService.clearCart(sessionId.toString());
  }
}
