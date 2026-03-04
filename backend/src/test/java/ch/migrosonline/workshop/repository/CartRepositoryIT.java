package ch.migrosonline.workshop.repository;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.entity.Cart;
import ch.migrosonline.workshop.entity.CartItem;
import ch.migrosonline.workshop.support.RepositoryTestSupport;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class CartRepositoryIT extends RepositoryTestSupport {

  @Autowired private CartRepository cartRepository;

  @Autowired private CartItemRepository cartItemRepository;

  @Autowired private ProductRepository productRepository;

  @Test
  void shouldCreateAndRetrieveCartBySessionId() {
    // given
    var cart =
        Cart.builder()
            .sessionId("test-session-1")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    cartRepository.saveAndFlush(cart);

    // when
    var result = cartRepository.findBySessionId("test-session-1");

    // then
    assertThat(result).isPresent();
    assertThat(result.get().getSessionId()).isEqualTo("test-session-1");
  }

  @Test
  void shouldReturnEmptyWhenSessionIdDoesNotExist() {
    // given — no cart with this session id

    // when
    var result = cartRepository.findBySessionId("unknown");

    // then
    assertThat(result).isEmpty();
  }

  @Test
  void shouldRetrieveCartWithItemsAndProductData() {
    // given — seeded product id 1
    var product = productRepository.findById(1L).orElseThrow();
    var cart =
        Cart.builder()
            .sessionId("test-session-items")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    var savedCart = cartRepository.saveAndFlush(cart);

    var item = CartItem.builder().cart(savedCart).product(product).quantity(2).build();
    savedCart.getItems().add(item);
    cartRepository.saveAndFlush(savedCart);

    // when
    var result = cartRepository.findBySessionId("test-session-items");

    // then
    assertThat(result).isPresent();
    assertThat(result.get().getItems()).hasSize(1);
    assertThat(result.get().getItems().getFirst().getProduct().getName())
        .isEqualTo("Wireless Bluetooth Headphones");
  }

  @Test
  void shouldFindCartItemByCartIdAndProductId() {
    // given
    var product = productRepository.findById(1L).orElseThrow();
    var cart =
        Cart.builder()
            .sessionId("test-session-find-item")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    var savedCart = cartRepository.saveAndFlush(cart);

    var item = CartItem.builder().cart(savedCart).product(product).quantity(1).build();
    savedCart.getItems().add(item);
    cartRepository.saveAndFlush(savedCart);

    // when
    var result = cartItemRepository.findByCartIdAndProductId(savedCart.getId(), product.getId());

    // then
    assertThat(result).isPresent();
    assertThat(result.get().getQuantity()).isEqualTo(1);
  }

  @Test
  void shouldReturnEmptyWhenProductNotInCart() {
    // given
    var cart =
        Cart.builder()
            .sessionId("test-session-no-product")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    var savedCart = cartRepository.saveAndFlush(cart);

    // when
    var result = cartItemRepository.findByCartIdAndProductId(savedCart.getId(), 99999L);

    // then
    assertThat(result).isEmpty();
  }

  @Test
  void shouldCascadeDeleteItemsWhenCartDeleted() {
    // given
    var product = productRepository.findById(1L).orElseThrow();
    var cart =
        Cart.builder()
            .sessionId("test-session-cascade")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    var savedCart = cartRepository.saveAndFlush(cart);

    var item = CartItem.builder().cart(savedCart).product(product).quantity(1).build();
    savedCart.getItems().add(item);
    cartRepository.saveAndFlush(savedCart);

    var cartId = savedCart.getId();
    var itemId = savedCart.getItems().getFirst().getId();
    assertThat(itemId).isNotNull();

    // when
    cartRepository.delete(savedCart);
    cartRepository.flush();

    // then
    assertThat(cartRepository.findById(cartId)).isEmpty();
    assertThat(cartItemRepository.findById(itemId)).isEmpty();
  }

  @Test
  void shouldRemoveOrphanedItemWhenRemovedFromList() {
    // given
    var product = productRepository.findById(1L).orElseThrow();
    var cart =
        Cart.builder()
            .sessionId("test-session-orphan")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    var savedCart = cartRepository.saveAndFlush(cart);

    var item = CartItem.builder().cart(savedCart).product(product).quantity(1).build();
    savedCart.getItems().add(item);
    cartRepository.saveAndFlush(savedCart);

    var itemId = savedCart.getItems().getFirst().getId();
    assertThat(itemId).isNotNull();

    // when
    savedCart.getItems().removeFirst();
    cartRepository.saveAndFlush(savedCart);

    // then
    assertThat(cartItemRepository.findById(itemId)).isEmpty();
  }
}
