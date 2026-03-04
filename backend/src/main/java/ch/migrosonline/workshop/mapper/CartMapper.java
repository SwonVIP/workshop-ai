package ch.migrosonline.workshop.mapper;

import ch.migrosonline.workshop.entity.CartEntity;
import ch.migrosonline.workshop.entity.CartItemEntity;
import ch.migrosonline.workshop.model.CartItemProductResponse;
import ch.migrosonline.workshop.model.CartItemResponse;
import ch.migrosonline.workshop.model.CartResponse;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class CartMapper {

  public CartResponse toResponse(CartEntity cart) {
    var items = cart.getItems().stream().map(this::toCartItemResponse).toList();
    var totalItems = cart.getItems().stream().mapToInt(CartItemEntity::getQuantity).sum();
    var totalPrice =
        cart.getItems().stream()
            .map(
                item ->
                    item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    return new CartResponse(cart.getId(), cart.getSessionId(), items, totalItems, totalPrice);
  }

  public CartItemResponse toCartItemResponse(CartItemEntity item) {
    var product = item.getProduct();
    var productResponse =
        new CartItemProductResponse(
            product.getId(), product.getName(), product.getPrice(), product.getImageUrl());
    var subtotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    return new CartItemResponse(item.getId(), productResponse, item.getQuantity(), subtotal);
  }
}
