package ch.migrosonline.workshop.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CartEqualsHashCodeTest {

  private Cart buildCart(String sessionId) {
    return Cart.builder().id(null).sessionId(sessionId).build();
  }

  @Test
  void shouldBeReflexive() {
    // given
    var a = buildCart("sess-1");

    // then
    assertThat(a.equals(a)).isTrue();
  }

  @Test
  void shouldBeSymmetric() {
    // given
    var a = buildCart("sess-1");
    var b = buildCart("sess-1");

    // then
    assertThat(a.equals(b)).isTrue();
    assertThat(b.equals(a)).isTrue();
  }

  @Test
  void shouldReturnFalseForNull() {
    // given
    var a = buildCart("sess-1");

    // then
    assertThat(a.equals(null)).isFalse();
  }

  @Test
  void shouldReturnFalseForDifferentClass() {
    // given
    var a = buildCart("sess-1");

    // then
    assertThat(a.equals("string")).isFalse();
  }

  @Test
  void shouldBeEqualWhenSameSessionId() {
    // given
    var a = buildCart("sess-1");
    var b = buildCart("sess-1");

    // then
    assertThat(a).isEqualTo(b);
  }

  @Test
  void shouldNotBeEqualWhenDifferentSessionId() {
    // given
    var a = buildCart("sess-1");
    var b = buildCart("sess-2");

    // then
    assertThat(a).isNotEqualTo(b);
  }

  @Test
  void shouldReturnFalseWhenSessionIdIsNull() {
    // given — Cart.equals returns false when sessionId is null
    var a = Cart.builder().id(1L).sessionId(null).build();
    var b = buildCart("sess-1");

    // then
    assertThat(a.equals(b)).isFalse();
  }

  @Test
  void shouldHaveSameHashCodeWhenEqual() {
    // given
    var a = buildCart("sess-1");
    var b = buildCart("sess-1");

    // then — contract: equal objects must have same hashCode
    assertThat(a).isEqualTo(b);
    assertThat(a.hashCode()).isEqualTo(b.hashCode());
  }
}
