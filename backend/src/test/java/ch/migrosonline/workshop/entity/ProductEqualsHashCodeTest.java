package ch.migrosonline.workshop.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ProductEqualsHashCodeTest {

  private Product buildProduct(Long id) {
    return Product.builder().id(id).name("product-" + id).build();
  }

  @Test
  void shouldBeReflexive() {
    // given
    var a = buildProduct(1L);

    // then
    assertThat(a.equals(a)).isTrue();
  }

  @Test
  void shouldBeSymmetric() {
    // given
    var a = buildProduct(1L);
    var b = buildProduct(1L);

    // then
    assertThat(a.equals(b)).isTrue();
    assertThat(b.equals(a)).isTrue();
  }

  @Test
  void shouldReturnFalseForNull() {
    // given
    var a = buildProduct(1L);

    // then
    assertThat(a.equals(null)).isFalse();
  }

  @Test
  void shouldReturnFalseForDifferentClass() {
    // given
    var a = buildProduct(1L);

    // then
    assertThat(a.equals("string")).isFalse();
  }

  @Test
  void shouldBeEqualWhenSameId() {
    // given
    var a = buildProduct(1L);
    var b = buildProduct(1L);

    // then
    assertThat(a).isEqualTo(b);
  }

  @Test
  void shouldNotBeEqualWhenDifferentId() {
    // given
    var a = buildProduct(1L);
    var b = buildProduct(2L);

    // then
    assertThat(a).isNotEqualTo(b);
  }

  @Test
  void shouldReturnFalseWhenIdIsNull() {
    // given — Product.equals returns false when id is null
    var a = Product.builder().id(null).name("x").build();
    var b = buildProduct(1L);

    // then
    assertThat(a.equals(b)).isFalse();
  }

  @Test
  void shouldHaveSameHashCodeWhenEqual() {
    // given
    var a = buildProduct(1L);
    var b = buildProduct(1L);

    // then — contract: equal objects must have same hashCode
    assertThat(a).isEqualTo(b);
    assertThat(a.hashCode()).isEqualTo(b.hashCode());
  }
}
