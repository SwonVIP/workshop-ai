package ch.migrosonline.workshop.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CartItemEntityEqualsHashCodeTest {

  private CartItemEntity buildItem(Long cartId, Long productId) {
    var cart = CartEntity.builder().id(cartId).sessionId("sess-" + cartId).build();
    var product = ProductEntity.builder().id(productId).name("product-" + productId).build();
    return CartItemEntity.builder().cart(cart).product(product).quantity(1).build();
  }

  @Test
  void shouldConsiderSameProductInSameCartAsTheSameLineItem() {
    // given — same product added to the same cart (e.g. loaded from two different queries)
    var item1 = buildItem(1L, 42L);
    var item2 = buildItem(1L, 42L);

    // then — same cart + same product = same line item
    assertThat(item1).isEqualTo(item2);
    assertThat(item1.hashCode()).isEqualTo(item2.hashCode());
  }

  @Test
  void shouldConsiderSameProductInDifferentCartsAsDifferentLineItems() {
    // given — same product but in Alice's cart vs Bob's cart
    var aliceItem = buildItem(1L, 42L);
    var bobItem = buildItem(2L, 42L);

    // then
    assertThat(aliceItem).isNotEqualTo(bobItem);
    assertThat(aliceItem.hashCode()).isNotEqualTo(bobItem.hashCode());
  }

  @Test
  void shouldConsiderDifferentProductsInSameCartAsDifferentLineItems() {
    // given — headphones and keyboard in the same cart
    var headphones = buildItem(1L, 10L);
    var keyboard = buildItem(1L, 20L);

    // then
    assertThat(headphones).isNotEqualTo(keyboard);
    assertThat(headphones.hashCode()).isNotEqualTo(keyboard.hashCode());
  }

  @Test
  void shouldNotMatchLineItemWithNull() {
    // given
    var item = buildItem(1L, 1L);

    // then
    assertThat(item).isNotEqualTo(null);
  }

  @Test
  void shouldNotMatchLineItemWithDifferentObjectType() {
    // given
    var item = buildItem(1L, 1L);

    // then
    assertThat(item.equals("not-a-cart-item")).isFalse();
  }

  @Test
  void shouldNotMatchWhenCartIsNull() {
    // given — an orphan item not yet associated with a cart
    var orphan =
        CartItemEntity.builder()
            .cart(null)
            .product(ProductEntity.builder().id(1L).build())
            .quantity(1)
            .build();
    var normal = buildItem(1L, 1L);

    // then
    assertThat(orphan).isNotEqualTo(normal);
  }

  @Test
  void shouldNotMatchWhenProductIsNull() {
    // given — an item with no product reference
    var broken =
        CartItemEntity.builder()
            .cart(CartEntity.builder().id(1L).sessionId("s").build())
            .product(null)
            .quantity(1)
            .build();
    var normal = buildItem(1L, 1L);

    // then
    assertThat(broken).isNotEqualTo(normal);
  }
}
