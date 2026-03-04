package ch.migrosonline.workshop.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.exception.ResourceNotFoundException;
import ch.migrosonline.workshop.model.AddToCartRequest;
import ch.migrosonline.workshop.model.CartResponse;
import ch.migrosonline.workshop.model.UpdateCartItemRequest;
import ch.migrosonline.workshop.service.CartService;
import ch.migrosonline.workshop.support.ControllerTestSupport;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(CartController.class)
class CartControllerTest extends ControllerTestSupport {

  @MockitoBean private CartService cartService;

  private static final String SESSION_ID = "test-session-123";
  private static final String SESSION_HEADER = "X-Cart-Session";

  @Test
  void shouldReturnCartWhenValidSessionHeaderProvided() throws Exception {
    // given
    var cartResponse = new CartResponse(1L, SESSION_ID, List.of(), 0, BigDecimal.ZERO);
    when(cartService.getCart(SESSION_ID)).thenReturn(cartResponse);

    // when/then
    assertThat(mvc.get().uri("/api/cart").header(SESSION_HEADER, SESSION_ID))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("sessionId")
        .isEqualTo(SESSION_ID);
  }

  @Test
  void shouldReturn400WhenSessionHeaderMissing() {
    // given — no X-Cart-Session header

    // when/then
    assertThat(mvc.get().uri("/api/cart")).hasStatus(HttpStatus.BAD_REQUEST);
  }

  @Test
  void shouldReturn201WhenItemAddedToCart() throws Exception {
    // given
    var cartResponse = new CartResponse(1L, SESSION_ID, List.of(), 1, new BigDecimal("89.99"));
    when(cartService.addItem(eq(SESSION_ID), any(AddToCartRequest.class))).thenReturn(cartResponse);
    var requestBody = jsonMapper.writeValueAsString(new AddToCartRequest(10L, 1));

    // when/then
    assertThat(
            mvc.post()
                .uri("/api/cart/items")
                .header(SESSION_HEADER, SESSION_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .hasStatus(HttpStatus.CREATED)
        .bodyJson()
        .extractingPath("totalItems")
        .isEqualTo(1);
  }

  @Test
  void shouldReturn400WhenAddToCartRequestMissingProductId() throws Exception {
    // given
    var requestBody = "{\"quantity\": 2}";

    // when/then
    assertThat(
            mvc.post()
                .uri("/api/cart/items")
                .header(SESSION_HEADER, SESSION_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .hasStatus(HttpStatus.BAD_REQUEST);
  }

  @Test
  void shouldReturn400WhenQuantityIsZero() throws Exception {
    // given
    var requestBody = jsonMapper.writeValueAsString(new AddToCartRequest(1L, 0));

    // when/then
    assertThat(
            mvc.post()
                .uri("/api/cart/items")
                .header(SESSION_HEADER, SESSION_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .hasStatus(HttpStatus.BAD_REQUEST);
  }

  @Test
  void shouldReturn400WhenQuantityIsNegative() throws Exception {
    // given
    var requestBody = jsonMapper.writeValueAsString(new AddToCartRequest(1L, -1));

    // when/then
    assertThat(
            mvc.post()
                .uri("/api/cart/items")
                .header(SESSION_HEADER, SESSION_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .hasStatus(HttpStatus.BAD_REQUEST);
  }

  @Test
  void shouldReturn404WhenAddingNonExistentProduct() throws Exception {
    // given
    when(cartService.addItem(eq(SESSION_ID), any(AddToCartRequest.class)))
        .thenThrow(new ResourceNotFoundException("Product not found with id: 999"));
    var requestBody = jsonMapper.writeValueAsString(new AddToCartRequest(999L, 1));

    // when/then
    assertThat(
            mvc.post()
                .uri("/api/cart/items")
                .header(SESSION_HEADER, SESSION_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .hasStatus(HttpStatus.NOT_FOUND);
  }

  @Test
  void shouldReturn200WhenCartItemQuantityUpdated() throws Exception {
    // given
    var cartResponse = new CartResponse(1L, SESSION_ID, List.of(), 5, new BigDecimal("449.95"));
    when(cartService.updateItemQuantity(eq(SESSION_ID), eq(10L), any(UpdateCartItemRequest.class)))
        .thenReturn(cartResponse);
    var requestBody = jsonMapper.writeValueAsString(new UpdateCartItemRequest(5));

    // when/then
    assertThat(
            mvc.put()
                .uri("/api/cart/items/10")
                .header(SESSION_HEADER, SESSION_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("totalItems")
        .isEqualTo(5);
  }

  @Test
  void shouldReturn204WhenCartItemRemoved() {
    // given
    doNothing().when(cartService).removeItem(SESSION_ID, 10L);

    // when/then
    assertThat(mvc.delete().uri("/api/cart/items/10").header(SESSION_HEADER, SESSION_ID))
        .hasStatus(HttpStatus.NO_CONTENT);
  }

  @Test
  void shouldReturn404WhenUpdatingNonExistentItem() throws Exception {
    // given
    when(cartService.updateItemQuantity(eq(SESSION_ID), eq(999L), any(UpdateCartItemRequest.class)))
        .thenThrow(new ResourceNotFoundException("Cart item not found with id: 999"));
    var requestBody = jsonMapper.writeValueAsString(new UpdateCartItemRequest(3));

    // when/then
    assertThat(
            mvc.put()
                .uri("/api/cart/items/999")
                .header(SESSION_HEADER, SESSION_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .hasStatus(HttpStatus.NOT_FOUND);
  }

  @Test
  void shouldReturn404WhenRemovingNonExistentItem() {
    // given
    doThrow(new ResourceNotFoundException("Cart item not found with id: 999"))
        .when(cartService)
        .removeItem(SESSION_ID, 999L);

    // when/then
    assertThat(mvc.delete().uri("/api/cart/items/999").header(SESSION_HEADER, SESSION_ID))
        .hasStatus(HttpStatus.NOT_FOUND);
  }

  @Test
  void shouldReturn400WhenUpdateQuantityIsZero() throws Exception {
    // given
    var requestBody = jsonMapper.writeValueAsString(new UpdateCartItemRequest(0));

    // when/then
    assertThat(
            mvc.put()
                .uri("/api/cart/items/10")
                .header(SESSION_HEADER, SESSION_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .hasStatus(HttpStatus.BAD_REQUEST);
  }
}
