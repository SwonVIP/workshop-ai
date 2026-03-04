package ch.migrosonline.workshop.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.entity.Cart;
import ch.migrosonline.workshop.entity.CartItem;
import ch.migrosonline.workshop.entity.Product;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class CartMapperTest {

  private final CartMapper mapper = new CartMapper();

  @Test
  void shouldMapCartEntityToResponseWithCorrectTotals() {
    // given
    var product1 =
        Product.builder()
            .id(1L)
            .name("Widget")
            .price(new BigDecimal("10.00"))
            .imageUrl("img1.png")
            .build();
    var product2 =
        Product.builder()
            .id(2L)
            .name("Gadget")
            .price(new BigDecimal("25.00"))
            .imageUrl("img2.png")
            .build();
    var cart = Cart.builder().id(1L).sessionId("sess-1").items(new ArrayList<>()).build();
    var item1 = CartItem.builder().id(1L).cart(cart).product(product1).quantity(2).build();
    var item2 = CartItem.builder().id(2L).cart(cart).product(product2).quantity(3).build();
    cart.setItems(List.of(item1, item2));

    // when
    var response = mapper.toResponse(cart);

    // then
    assertThat(response.totalItems()).isEqualTo(5);
    assertThat(response.totalPrice()).isEqualByComparingTo(new BigDecimal("95.00"));
    assertThat(response.items()).hasSize(2);
  }

  @Test
  void shouldCalculateSubtotalForCartItemResponse() {
    // given
    var product =
        Product.builder()
            .id(1L)
            .name("Shoes")
            .price(new BigDecimal("29.99"))
            .imageUrl("shoes.png")
            .build();
    var cart = Cart.builder().id(1L).sessionId("sess-2").items(new ArrayList<>()).build();
    var item = CartItem.builder().id(1L).cart(cart).product(product).quantity(3).build();

    // when
    var response = mapper.toCartItemResponse(item);

    // then
    assertThat(response.subtotal()).isEqualByComparingTo(new BigDecimal("89.97"));
  }

  @Test
  void shouldMapEmptyCartToResponseWithZeroTotals() {
    // given
    var cart = Cart.builder().id(1L).sessionId("sess-3").items(new ArrayList<>()).build();

    // when
    var response = mapper.toResponse(cart);

    // then
    assertThat(response.totalItems()).isZero();
    assertThat(response.totalPrice()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(response.items()).isEmpty();
  }

  @Test
  void shouldMapCartItemProductFields() {
    // given
    var product =
        Product.builder()
            .id(42L)
            .name("Bluetooth Speaker")
            .price(new BigDecimal("59.99"))
            .imageUrl("https://example.com/speaker.png")
            .build();
    var cart = Cart.builder().id(1L).sessionId("sess-4").items(new ArrayList<>()).build();
    var item = CartItem.builder().id(1L).cart(cart).product(product).quantity(1).build();

    // when
    var response = mapper.toCartItemResponse(item);

    // then
    assertThat(response.product().id()).isEqualTo(42L);
    assertThat(response.product().name()).isEqualTo("Bluetooth Speaker");
    assertThat(response.product().price()).isEqualByComparingTo(new BigDecimal("59.99"));
    assertThat(response.product().imageUrl()).isEqualTo("https://example.com/speaker.png");
  }

  @Test
  void shouldHandleSingleItemCart() {
    // given
    var product =
        Product.builder()
            .id(1L)
            .name("Book")
            .price(new BigDecimal("15.00"))
            .imageUrl("book.png")
            .build();
    var cart = Cart.builder().id(1L).sessionId("sess-5").items(new ArrayList<>()).build();
    var item = CartItem.builder().id(1L).cart(cart).product(product).quantity(1).build();
    cart.setItems(List.of(item));

    // when
    var response = mapper.toResponse(cart);

    // then
    assertThat(response.totalItems()).isEqualTo(1);
    assertThat(response.totalPrice()).isEqualByComparingTo(new BigDecimal("15.00"));
    assertThat(response.items()).hasSize(1);
    assertThat(response.sessionId()).isEqualTo("sess-5");
  }
}
