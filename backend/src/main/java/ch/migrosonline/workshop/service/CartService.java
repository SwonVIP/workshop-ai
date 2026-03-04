package ch.migrosonline.workshop.service;

import ch.migrosonline.workshop.entity.CartEntity;
import ch.migrosonline.workshop.entity.CartItemEntity;
import ch.migrosonline.workshop.exception.ResourceNotFoundException;
import ch.migrosonline.workshop.mapper.CartMapper;
import ch.migrosonline.workshop.model.AddToCartRequest;
import ch.migrosonline.workshop.model.CartResponse;
import ch.migrosonline.workshop.model.UpdateCartItemRequest;
import ch.migrosonline.workshop.repository.CartItemRepository;
import ch.migrosonline.workshop.repository.CartRepository;
import ch.migrosonline.workshop.repository.ProductRepository;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {

  private static final String CART_NOT_FOUND_MSG = "Cart not found for session: ";
  private static final String PRODUCT_NOT_FOUND_MSG = "Product not found with id: ";
  private static final String CART_ITEM_NOT_FOUND_MSG = "Cart item not found with id: ";

  private final CartRepository cartRepository;
  private final CartItemRepository cartItemRepository;
  private final ProductRepository productRepository;
  private final CartMapper cartMapper;

  private CartEntity findOrCreateCart(String sessionId) {
    return cartRepository
        .findBySessionId(sessionId)
        .orElseGet(
            () ->
                cartRepository.save(
                    CartEntity.builder().sessionId(sessionId).items(new ArrayList<>()).build()));
  }

  @Transactional
  public CartResponse getCart(String sessionId) {
    var cart = findOrCreateCart(sessionId);
    return cartMapper.toResponse(cart);
  }

  @Transactional
  public CartResponse addItem(String sessionId, AddToCartRequest request) {
    var cart = findOrCreateCart(sessionId);
    var product =
        productRepository
            .findById(request.productId())
            .orElseThrow(
                () -> new ResourceNotFoundException(PRODUCT_NOT_FOUND_MSG + request.productId()));
    var existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
    if (existingItem.isPresent()) {
      existingItem.get().setQuantity(existingItem.get().getQuantity() + request.quantity());
    } else {
      var newItem =
          CartItemEntity.builder().cart(cart).product(product).quantity(request.quantity()).build();
      cart.getItems().add(newItem);
    }
    cartRepository.save(cart);
    // Re-fetch with @EntityGraph to ensure product data is loaded
    var updatedCart = cartRepository.findBySessionId(sessionId).orElseThrow();
    return cartMapper.toResponse(updatedCart);
  }

  @Transactional
  public CartResponse updateItemQuantity(
      String sessionId, Long itemId, UpdateCartItemRequest request) {
    var cart =
        cartRepository
            .findBySessionId(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException(CART_NOT_FOUND_MSG + sessionId));
    var item =
        cartItemRepository
            .findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException(CART_ITEM_NOT_FOUND_MSG + itemId));
    if (!item.getCart().getId().equals(cart.getId())) {
      throw new ResourceNotFoundException(CART_ITEM_NOT_FOUND_MSG + itemId);
    }
    item.setQuantity(request.quantity());
    cartItemRepository.save(item);
    var updatedCart = cartRepository.findBySessionId(sessionId).orElseThrow();
    return cartMapper.toResponse(updatedCart);
  }

  @Transactional
  public void removeItem(String sessionId, Long itemId) {
    var cart =
        cartRepository
            .findBySessionId(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException(CART_NOT_FOUND_MSG + sessionId));
    var item =
        cartItemRepository
            .findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException(CART_ITEM_NOT_FOUND_MSG + itemId));
    if (!item.getCart().getId().equals(cart.getId())) {
      throw new ResourceNotFoundException(CART_ITEM_NOT_FOUND_MSG + itemId);
    }
    cart.getItems().remove(item);
    cartRepository.save(cart);
  }

  @Transactional
  public CartResponse clearCart(String sessionId) {
    var cart =
        cartRepository
            .findBySessionId(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException(CART_NOT_FOUND_MSG + sessionId));
    cart.getItems().clear();
    cartRepository.save(cart);
    var updatedCart = cartRepository.findBySessionId(sessionId).orElseThrow();
    return cartMapper.toResponse(updatedCart);
  }
}
