package ch.migrosonline.workshop.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CartEqualsHashCodeTest {

  @Test
  void shouldConsiderTwoCartsWithSameSessionAsTheSameCart() {
    // given — two cart instances for the same browser session
    var cart1 = Cart.builder().id(1L).sessionId("abc-123").build();
    var cart2 = Cart.builder().id(2L).sessionId("abc-123").build();

    // then — same session means same cart
    assertThat(cart1).isEqualTo(cart2);
    assertThat(cart1.hashCode()).isEqualTo(cart2.hashCode());
  }

  @Test
  void shouldConsiderCartsFromDifferentSessionsAsDifferentCarts() {
    // given — two different browser sessions
    var cart1 = Cart.builder().id(1L).sessionId("session-alice").build();
    var cart2 = Cart.builder().id(2L).sessionId("session-bob").build();

    // then
    assertThat(cart1).isNotEqualTo(cart2);
    assertThat(cart1.hashCode()).isNotEqualTo(cart2.hashCode());
  }

  @Test
  void shouldNotMatchCartWithNull() {
    // given
    var cart = Cart.builder().sessionId("abc-123").build();

    // then
    assertThat(cart).isNotEqualTo(null);
  }

  @Test
  void shouldNotMatchCartWithDifferentObjectType() {
    // given
    var cart = Cart.builder().sessionId("abc-123").build();

    // then
    assertThat(cart.equals("abc-123")).isFalse();
  }

  @Test
  void shouldNotMatchWhenSessionIdIsNull() {
    // given — a cart not yet assigned to a session
    var unassigned = Cart.builder().id(1L).sessionId(null).build();
    var assigned = Cart.builder().id(2L).sessionId("abc-123").build();

    // then
    assertThat(unassigned).isNotEqualTo(assigned);
  }
}
