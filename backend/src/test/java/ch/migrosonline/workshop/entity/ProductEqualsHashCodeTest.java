package ch.migrosonline.workshop.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ProductEqualsHashCodeTest {

  @Test
  void shouldConsiderTwoProductsWithSameIdAsTheSameProduct() {
    // given — same product loaded from different queries
    var product1 = Product.builder().id(42L).name("Headphones v1").build();
    var product2 = Product.builder().id(42L).name("Headphones v2").build();

    // then — same id means same product
    assertThat(product1).isEqualTo(product2);
    assertThat(product1.hashCode()).isEqualTo(product2.hashCode());
  }

  @Test
  void shouldConsiderProductsWithDifferentIdsAsDifferentProducts() {
    // given
    var headphones = Product.builder().id(1L).name("Headphones").build();
    var keyboard = Product.builder().id(2L).name("Keyboard").build();

    // then
    assertThat(headphones).isNotEqualTo(keyboard);
    assertThat(headphones.hashCode()).isNotEqualTo(keyboard.hashCode());
  }

  @Test
  void shouldNotMatchProductWithNull() {
    // given
    var product = Product.builder().id(1L).name("Headphones").build();

    // then
    assertThat(product).isNotEqualTo(null);
  }

  @Test
  void shouldNotMatchProductWithDifferentObjectType() {
    // given
    var product = Product.builder().id(1L).name("Headphones").build();

    // then
    assertThat(product.equals("Headphones")).isFalse();
  }

  @Test
  void shouldNotMatchWhenProductIdIsNull() {
    // given — a transient product not yet persisted
    var unsaved = Product.builder().id(null).name("New Product").build();
    var saved = Product.builder().id(1L).name("Headphones").build();

    // then
    assertThat(unsaved).isNotEqualTo(saved);
  }
}
