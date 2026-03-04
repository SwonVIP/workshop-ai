package ch.migrosonline.workshop.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.entity.Cart;
import ch.migrosonline.workshop.entity.CartItem;
import ch.migrosonline.workshop.entity.Product;
import ch.migrosonline.workshop.exception.ResourceNotFoundException;
import ch.migrosonline.workshop.mapper.CartMapper;
import ch.migrosonline.workshop.model.CartResponse;
import ch.migrosonline.workshop.repository.CartItemRepository;
import ch.migrosonline.workshop.repository.CartRepository;
import ch.migrosonline.workshop.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

  @Mock private CartRepository cartRepository;

  @Mock private CartItemRepository cartItemRepository;

  @Mock private ProductRepository productRepository;

  @Mock private CartMapper cartMapper;

  @InjectMocks private CartService cartService;

  private static final String SESSION_ID = "test-session-123";

  @Test
  void shouldReturnEmptyCartWhenSessionIsNew() {
    // given
    var savedCart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var expectedResponse = new CartResponse(1L, SESSION_ID, List.of(), 0, BigDecimal.ZERO);
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.empty());
    when(cartRepository.save(any(Cart.class))).thenReturn(savedCart);
    when(cartMapper.toResponse(savedCart)).thenReturn(expectedResponse);

    // when
    var result = cartService.getCart(SESSION_ID);

    // then
    assertThat(result.id()).isEqualTo(1L);
    assertThat(result.items()).isEmpty();
    assertThat(result.totalItems()).isZero();
    assertThat(result.totalPrice()).isEqualTo(BigDecimal.ZERO);
    verify(cartRepository).save(any(Cart.class));
  }

  @Test
  void shouldReturnExistingCartWhenSessionHasCart() {
    // given
    var existingCart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var expectedResponse = new CartResponse(1L, SESSION_ID, List.of(), 0, BigDecimal.ZERO);
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(existingCart));
    when(cartMapper.toResponse(existingCart)).thenReturn(expectedResponse);

    // when
    var result = cartService.getCart(SESSION_ID);

    // then
    assertThat(result.id()).isEqualTo(1L);
    verify(cartRepository, never()).save(any(Cart.class));
  }

  @Test
  void shouldAddNewItemToCart() {
    // given
    var cart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var product =
        Product.builder().id(10L).name("Headphones").price(new BigDecimal("89.99")).build();
    var updatedCart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var expectedResponse = new CartResponse(1L, SESSION_ID, List.of(), 1, new BigDecimal("89.99"));

    when(cartRepository.findBySessionId(SESSION_ID))
        .thenReturn(Optional.of(cart))
        .thenReturn(Optional.of(updatedCart));
    when(productRepository.findById(10L)).thenReturn(Optional.of(product));
    when(cartItemRepository.findByCartIdAndProductId(1L, 10L)).thenReturn(Optional.empty());
    when(cartMapper.toResponse(updatedCart)).thenReturn(expectedResponse);

    // when
    var request = new ch.migrosonline.workshop.model.AddToCartRequest(10L, 1);
    var result = cartService.addItem(SESSION_ID, request);

    // then
    assertThat(result.totalItems()).isEqualTo(1);
    verify(cartRepository).save(cart);
  }

  @Test
  void shouldIncrementQuantityWhenAddingSameProductAgain() {
    // given
    var cart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var product =
        Product.builder().id(10L).name("Headphones").price(new BigDecimal("89.99")).build();
    var existingItem = CartItem.builder().id(5L).cart(cart).product(product).quantity(2).build();
    var updatedCart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var expectedResponse = new CartResponse(1L, SESSION_ID, List.of(), 5, new BigDecimal("449.95"));

    when(cartRepository.findBySessionId(SESSION_ID))
        .thenReturn(Optional.of(cart))
        .thenReturn(Optional.of(updatedCart));
    when(productRepository.findById(10L)).thenReturn(Optional.of(product));
    when(cartItemRepository.findByCartIdAndProductId(1L, 10L))
        .thenReturn(Optional.of(existingItem));
    when(cartMapper.toResponse(updatedCart)).thenReturn(expectedResponse);

    // when
    var request = new ch.migrosonline.workshop.model.AddToCartRequest(10L, 3);
    cartService.addItem(SESSION_ID, request);

    // then
    assertThat(existingItem.getQuantity()).isEqualTo(5);
  }

  @Test
  void shouldThrowNotFoundWhenAddingNonExistentProduct() {
    // given
    var cart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(productRepository.findById(999L)).thenReturn(Optional.empty());

    // when/then
    var request = new ch.migrosonline.workshop.model.AddToCartRequest(999L, 1);
    assertThatThrownBy(() -> cartService.addItem(SESSION_ID, request))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Product not found with id: 999");
  }

  @Test
  void shouldCreateCartAutomaticallyWhenAddingItemToNewSession() {
    // given
    var newCart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var product =
        Product.builder().id(10L).name("Headphones").price(new BigDecimal("89.99")).build();
    var expectedResponse = new CartResponse(1L, SESSION_ID, List.of(), 1, new BigDecimal("89.99"));

    when(cartRepository.findBySessionId(SESSION_ID))
        .thenReturn(Optional.empty())
        .thenReturn(Optional.of(newCart));
    when(cartRepository.save(any(Cart.class))).thenReturn(newCart);
    when(productRepository.findById(10L)).thenReturn(Optional.of(product));
    when(cartItemRepository.findByCartIdAndProductId(1L, 10L)).thenReturn(Optional.empty());
    when(cartMapper.toResponse(newCart)).thenReturn(expectedResponse);

    // when
    var request = new ch.migrosonline.workshop.model.AddToCartRequest(10L, 1);
    var result = cartService.addItem(SESSION_ID, request);

    // then
    assertThat(result).isNotNull();
    verify(cartRepository, atLeastOnce()).save(any(Cart.class));
  }

  @Test
  void shouldUpdateCartItemQuantity() {
    // given
    var cart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var item = CartItem.builder().id(5L).cart(cart).quantity(2).build();
    var updatedCart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var expectedResponse = new CartResponse(1L, SESSION_ID, List.of(), 7, BigDecimal.ZERO);

    when(cartRepository.findBySessionId(SESSION_ID))
        .thenReturn(Optional.of(cart))
        .thenReturn(Optional.of(updatedCart));
    when(cartItemRepository.findById(5L)).thenReturn(Optional.of(item));
    when(cartMapper.toResponse(updatedCart)).thenReturn(expectedResponse);

    // when
    var request = new ch.migrosonline.workshop.model.UpdateCartItemRequest(7);
    var result = cartService.updateItemQuantity(SESSION_ID, 5L, request);

    // then
    assertThat(item.getQuantity()).isEqualTo(7);
    verify(cartItemRepository).save(item);
  }

  @Test
  void shouldThrowNotFoundWhenUpdatingNonExistentItem() {
    // given
    var cart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

    // when/then
    var request = new ch.migrosonline.workshop.model.UpdateCartItemRequest(3);
    assertThatThrownBy(() -> cartService.updateItemQuantity(SESSION_ID, 999L, request))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Cart item not found with id: 999");
  }

  @Test
  void shouldThrowNotFoundWhenItemDoesNotBelongToCart() {
    // given
    var cart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var otherCart = Cart.builder().id(99L).sessionId("other-session").build();
    var item = CartItem.builder().id(5L).cart(otherCart).quantity(2).build();

    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(cartItemRepository.findById(5L)).thenReturn(Optional.of(item));

    // when/then
    var request = new ch.migrosonline.workshop.model.UpdateCartItemRequest(3);
    assertThatThrownBy(() -> cartService.updateItemQuantity(SESSION_ID, 5L, request))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Cart item not found with id: 5");
  }

  @Test
  void shouldRemoveItemFromCart() {
    // given
    var cart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var item = CartItem.builder().id(5L).cart(cart).quantity(2).build();
    cart.getItems().add(item);

    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(cartItemRepository.findById(5L)).thenReturn(Optional.of(item));

    // when
    cartService.removeItem(SESSION_ID, 5L);

    // then
    assertThat(cart.getItems()).doesNotContain(item);
    verify(cartRepository).save(cart);
  }

  @Test
  void shouldThrowNotFoundWhenRemovingFromNonExistentCart() {
    // given
    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.empty());

    // when/then
    assertThatThrownBy(() -> cartService.removeItem(SESSION_ID, 5L))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Cart not found for session: " + SESSION_ID);
  }

  @Test
  void shouldLeaveEmptyCartAfterRemovingLastItem() {
    // given
    var cart = Cart.builder().id(1L).sessionId(SESSION_ID).items(new ArrayList<>()).build();
    var item = CartItem.builder().id(5L).cart(cart).quantity(1).build();
    cart.getItems().add(item);

    when(cartRepository.findBySessionId(SESSION_ID)).thenReturn(Optional.of(cart));
    when(cartItemRepository.findById(5L)).thenReturn(Optional.of(item));

    // when
    cartService.removeItem(SESSION_ID, 5L);

    // then
    assertThat(cart.getItems()).isEmpty();
    verify(cartRepository).save(cart);
  }
}
