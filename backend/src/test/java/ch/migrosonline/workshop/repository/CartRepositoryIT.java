package ch.migrosonline.workshop.repository;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.entity.CartEntity;
import ch.migrosonline.workshop.entity.CartItemEntity;
import ch.migrosonline.workshop.support.RepositoryTestSupport;
import java.time.Instant;
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
        CartEntity.builder()
            .sessionId("test-session-1")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    cartRepository.saveAndFlush(cart);

    // when
    var result = cartRepository.findBySessionId("test-session-1");

    // then
    assertThat(result).isPresent();
    assertThat(result.get().getSessionId()).isEqualTo("test-session-1");
    assertThat(result.get().getId()).isNotNull();
    assertThat(result.get().getItems()).isEmpty();
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
        CartEntity.builder()
            .sessionId("test-session-items")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    var savedCart = cartRepository.saveAndFlush(cart);

    var item = CartItemEntity.builder().cart(savedCart).product(product).quantity(2).build();
    savedCart.getItems().add(item);
    cartRepository.saveAndFlush(savedCart);

    // when
    var result = cartRepository.findBySessionId("test-session-items");

    // then
    assertThat(result).isPresent();
    assertThat(result.get().getSessionId()).isEqualTo("test-session-items");
    assertThat(result.get().getItems()).hasSize(1);
    var retrievedItem = result.get().getItems().getFirst();
    assertThat(retrievedItem.getQuantity()).isEqualTo(2);
    assertThat(retrievedItem.getProduct().getName()).isEqualTo("Wireless Bluetooth Headphones");
    assertThat(retrievedItem.getProduct().getId()).isEqualTo(1L);
  }

  @Test
  void shouldFindCartItemByCartIdAndProductId() {
    // given
    var product = productRepository.findById(1L).orElseThrow();
    var cart =
        CartEntity.builder()
            .sessionId("test-session-find-item")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    var savedCart = cartRepository.saveAndFlush(cart);

    var item = CartItemEntity.builder().cart(savedCart).product(product).quantity(1).build();
    savedCart.getItems().add(item);
    cartRepository.saveAndFlush(savedCart);

    // when
    var result = cartItemRepository.findByCartIdAndProductId(savedCart.getId(), product.getId());

    // then
    assertThat(result).isPresent();
    assertThat(result.get().getQuantity()).isEqualTo(1);
    assertThat(result.get().getProduct().getId()).isEqualTo(product.getId());
    assertThat(result.get().getProduct().getName()).isEqualTo("Wireless Bluetooth Headphones");
    assertThat(result.get().getCart().getId()).isEqualTo(savedCart.getId());
  }

  @Test
  void shouldReturnEmptyWhenProductNotInCart() {
    // given
    var cart =
        CartEntity.builder()
            .sessionId("test-session-no-product")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
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
        CartEntity.builder()
            .sessionId("test-session-cascade")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    var savedCart = cartRepository.saveAndFlush(cart);

    var item = CartItemEntity.builder().cart(savedCart).product(product).quantity(1).build();
    savedCart.getItems().add(item);
    cartRepository.saveAndFlush(savedCart);

    var cartId = savedCart.getId();
    var retrievedItem = savedCart.getItems().getFirst();
    var itemId = retrievedItem.getId();
    assertThat(itemId).isNotNull();
    assertThat(retrievedItem.getQuantity()).isEqualTo(1);
    assertThat(retrievedItem.getProduct().getId()).isEqualTo(1L);

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
        CartEntity.builder()
            .sessionId("test-session-orphan")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    var savedCart = cartRepository.saveAndFlush(cart);

    var item = CartItemEntity.builder().cart(savedCart).product(product).quantity(1).build();
    savedCart.getItems().add(item);
    cartRepository.saveAndFlush(savedCart);

    var orphanItem = savedCart.getItems().getFirst();
    var itemId = orphanItem.getId();
    assertThat(itemId).isNotNull();
    assertThat(orphanItem.getQuantity()).isEqualTo(1);
    assertThat(orphanItem.getProduct().getId()).isEqualTo(1L);

    // when
    savedCart.getItems().removeFirst();
    cartRepository.saveAndFlush(savedCart);

    // then
    assertThat(cartItemRepository.findById(itemId)).isEmpty();
  }

  @Test
  void shouldClearAllItemsWhenItemsListCleared() {
    // given
    var product1 = productRepository.findById(1L).orElseThrow();
    var product2 = productRepository.findById(2L).orElseThrow();
    var cart =
        CartEntity.builder()
            .sessionId("test-session-clear")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    var savedCart = cartRepository.saveAndFlush(cart);

    var item1 = CartItemEntity.builder().cart(savedCart).product(product1).quantity(2).build();
    var item2 = CartItemEntity.builder().cart(savedCart).product(product2).quantity(3).build();
    savedCart.getItems().add(item1);
    savedCart.getItems().add(item2);
    cartRepository.saveAndFlush(savedCart);
    assertThat(savedCart.getItems()).hasSize(2);
    assertThat(savedCart.getItems().get(0).getQuantity()).isEqualTo(2);
    assertThat(savedCart.getItems().get(1).getQuantity()).isEqualTo(3);

    // when
    savedCart.getItems().clear();
    cartRepository.saveAndFlush(savedCart);

    // then
    var reloaded = cartRepository.findBySessionId("test-session-clear");
    assertThat(reloaded).isPresent();
    assertThat(reloaded.get().getSessionId()).isEqualTo("test-session-clear");
    assertThat(reloaded.get().getItems()).isEmpty();
  }
}
