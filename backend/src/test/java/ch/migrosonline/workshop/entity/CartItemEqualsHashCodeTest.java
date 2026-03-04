package ch.migrosonline.workshop.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CartItemEqualsHashCodeTest {

  private CartItem buildItem(Long cartId, Long productId) {
    var cart = Cart.builder().id(cartId).sessionId("sess-" + cartId).build();
    var product = Product.builder().id(productId).name("product-" + productId).build();
    return CartItem.builder().id(null).cart(cart).product(product).quantity(1).build();
  }

  @Test
  void shouldBeReflexive() {
    // given
    var a = buildItem(1L, 1L);

    // then
    assertThat(a.equals(a)).isTrue();
  }

  @Test
  void shouldBeSymmetric() {
    // given
    var a = buildItem(1L, 1L);
    var b = buildItem(1L, 1L);

    // then
    assertThat(a.equals(b)).isTrue();
    assertThat(b.equals(a)).isTrue();
  }

  @Test
  void shouldReturnFalseForNull() {
    // given
    var a = buildItem(1L, 1L);

    // then
    assertThat(a.equals(null)).isFalse();
  }

  @Test
  void shouldReturnFalseForDifferentClass() {
    // given
    var a = buildItem(1L, 1L);

    // then
    assertThat(a.equals("string")).isFalse();
  }

  @Test
  void shouldBeEqualWhenSameCartIdAndProductId() {
    // given
    var a = buildItem(1L, 1L);
    var b = buildItem(1L, 1L);

    // then
    assertThat(a).isEqualTo(b);
  }

  @Test
  void shouldNotBeEqualWhenDifferentCartId() {
    // given
    var a = buildItem(1L, 1L);
    var b = buildItem(2L, 1L);

    // then
    assertThat(a).isNotEqualTo(b);
  }

  @Test
  void shouldNotBeEqualWhenDifferentProductId() {
    // given
    var a = buildItem(1L, 1L);
    var b = buildItem(1L, 2L);

    // then
    assertThat(a).isNotEqualTo(b);
  }

  @Test
  void shouldHandleNullCart() {
    // given — CartItem with null cart returns false for equals
    var a =
        CartItem.builder().cart(null).product(Product.builder().id(1L).build()).quantity(1).build();
    var b = buildItem(1L, 1L);

    // then
    assertThat(a.equals(b)).isFalse();
  }

  @Test
  void shouldHandleNullProduct() {
    // given — CartItem with null product returns false for equals
    var a =
        CartItem.builder()
            .cart(Cart.builder().id(1L).sessionId("s").build())
            .product(null)
            .quantity(1)
            .build();
    var b = buildItem(1L, 1L);

    // then
    assertThat(a.equals(b)).isFalse();
  }

  @Test
  void shouldHaveSameHashCodeWhenEqual() {
    // given
    var a = buildItem(1L, 1L);
    var b = buildItem(1L, 1L);

    // then — contract: equal objects must have same hashCode
    assertThat(a).isEqualTo(b);
    assertThat(a.hashCode()).isEqualTo(b.hashCode());
  }
}
