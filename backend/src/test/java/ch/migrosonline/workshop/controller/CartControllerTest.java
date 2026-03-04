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

  private static final String SESSION_ID = "550e8400-e29b-41d4-a716-446655440000";
  private static final String SESSION_HEADER = "X-CartEntity-Session";

  @Test
  void shouldReturnCartWhenValidSessionHeaderProvided() {
    // given
    var cartResponse = new CartResponse(1L, SESSION_ID, List.of(), 0, BigDecimal.ZERO);
    when(cartService.getCart(SESSION_ID)).thenReturn(cartResponse);

    // when
    var result = mvc.get().uri("/api/cart").header(SESSION_HEADER, SESSION_ID).exchange();

    // then
    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("sessionId").isEqualTo(SESSION_ID);
    assertThat(result).bodyJson().extractingPath("id").isEqualTo(1);
    assertThat(result).bodyJson().extractingPath("totalItems").isEqualTo(0);
    assertThat(result).bodyJson().extractingPath("totalPrice").isEqualTo(0);
    assertThat(result).bodyJson().extractingPath("items").asList().isEmpty();
  }

  @Test
  void shouldReturn400WhenSessionHeaderMissing() {
    // given — no X-CartEntity-Session header

    // when
    var result = mvc.get().uri("/api/cart").exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(400);
    assertThat(result).bodyJson().extractingPath("error").isEqualTo("Bad Request");
  }

  @Test
  void shouldReturn400WhenSessionIdIsNotValidUuid() {
    // given — an invalid (non-UUID) session ID
    var invalidSessionId = "not-a-valid-uuid";

    // when
    var result = mvc.get().uri("/api/cart").header(SESSION_HEADER, invalidSessionId).exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
  }

  @Test
  void shouldReturn201WhenItemAddedToCart() throws Exception {
    // given
    var cartResponse = new CartResponse(1L, SESSION_ID, List.of(), 1, new BigDecimal("89.99"));
    when(cartService.addItem(eq(SESSION_ID), any(AddToCartRequest.class))).thenReturn(cartResponse);
    var requestBody = jsonMapper.writeValueAsString(new AddToCartRequest(10L, 1));

    // when
    var result =
        mvc.post()
            .uri("/api/cart/items")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.CREATED);
    assertThat(result).bodyJson().extractingPath("id").isEqualTo(1);
    assertThat(result).bodyJson().extractingPath("sessionId").isEqualTo(SESSION_ID);
    assertThat(result).bodyJson().extractingPath("totalItems").isEqualTo(1);
    assertThat(result).bodyJson().extractingPath("totalPrice").isEqualTo(89.99);
  }

  @Test
  void shouldReturn400WhenAddToCartRequestMissingProductId() throws Exception {
    // given
    var requestBody = "{\"quantity\": 2}";

    // when
    var result =
        mvc.post()
            .uri("/api/cart/items")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(400);
    assertThat(result).bodyJson().extractingPath("error").isEqualTo("Validation Failed");
  }

  @Test
  void shouldReturn400WhenQuantityIsZero() throws Exception {
    // given
    var requestBody = jsonMapper.writeValueAsString(new AddToCartRequest(1L, 0));

    // when
    var result =
        mvc.post()
            .uri("/api/cart/items")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(400);
    assertThat(result).bodyJson().extractingPath("error").isEqualTo("Validation Failed");
  }

  @Test
  void shouldReturn400WhenQuantityIsNegative() throws Exception {
    // given
    var requestBody = jsonMapper.writeValueAsString(new AddToCartRequest(1L, -1));

    // when
    var result =
        mvc.post()
            .uri("/api/cart/items")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(400);
    assertThat(result).bodyJson().extractingPath("error").isEqualTo("Validation Failed");
  }

  @Test
  void shouldReturn404WhenAddingNonExistentProduct() throws Exception {
    // given
    when(cartService.addItem(eq(SESSION_ID), any(AddToCartRequest.class)))
        .thenThrow(new ResourceNotFoundException("Product not found with id: 999"));
    var requestBody = jsonMapper.writeValueAsString(new AddToCartRequest(999L, 1));

    // when
    var result =
        mvc.post()
            .uri("/api/cart/items")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.NOT_FOUND);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(404);
    assertThat(result).bodyJson().extractingPath("error").isEqualTo("Not Found");
    assertThat(result)
        .bodyJson()
        .extractingPath("message")
        .isEqualTo("Product not found with id: 999");
  }

  @Test
  void shouldReturn200WhenCartItemQuantityUpdated() throws Exception {
    // given
    var cartResponse = new CartResponse(1L, SESSION_ID, List.of(), 5, new BigDecimal("449.95"));
    when(cartService.updateItemQuantity(eq(SESSION_ID), eq(10L), any(UpdateCartItemRequest.class)))
        .thenReturn(cartResponse);
    var requestBody = jsonMapper.writeValueAsString(new UpdateCartItemRequest(5));

    // when
    var result =
        mvc.put()
            .uri("/api/cart/items/10")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("id").isEqualTo(1);
    assertThat(result).bodyJson().extractingPath("sessionId").isEqualTo(SESSION_ID);
    assertThat(result).bodyJson().extractingPath("totalItems").isEqualTo(5);
    assertThat(result).bodyJson().extractingPath("totalPrice").isEqualTo(449.95);
  }

  @Test
  void shouldReturn204WhenCartItemRemoved() {
    // given
    doNothing().when(cartService).removeItem(SESSION_ID, 10L);

    // when
    var result =
        mvc.delete().uri("/api/cart/items/10").header(SESSION_HEADER, SESSION_ID).exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.NO_CONTENT).hasBodyTextEqualTo("");
  }

  @Test
  void shouldReturn404WhenUpdatingNonExistentItem() throws Exception {
    // given
    when(cartService.updateItemQuantity(eq(SESSION_ID), eq(999L), any(UpdateCartItemRequest.class)))
        .thenThrow(new ResourceNotFoundException("Cart item not found with id: 999"));
    var requestBody = jsonMapper.writeValueAsString(new UpdateCartItemRequest(3));

    // when
    var result =
        mvc.put()
            .uri("/api/cart/items/999")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.NOT_FOUND);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(404);
    assertThat(result)
        .bodyJson()
        .extractingPath("message")
        .isEqualTo("Cart item not found with id: 999");
  }

  @Test
  void shouldReturn404WhenRemovingNonExistentItem() {
    // given
    doThrow(new ResourceNotFoundException("Cart item not found with id: 999"))
        .when(cartService)
        .removeItem(SESSION_ID, 999L);

    // when
    var result =
        mvc.delete().uri("/api/cart/items/999").header(SESSION_HEADER, SESSION_ID).exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.NOT_FOUND);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(404);
    assertThat(result)
        .bodyJson()
        .extractingPath("message")
        .isEqualTo("Cart item not found with id: 999");
  }

  @Test
  void shouldReturn400WhenUpdateQuantityIsZero() throws Exception {
    // given
    var requestBody = jsonMapper.writeValueAsString(new UpdateCartItemRequest(0));

    // when
    var result =
        mvc.put()
            .uri("/api/cart/items/10")
            .header(SESSION_HEADER, SESSION_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(400);
    assertThat(result).bodyJson().extractingPath("error").isEqualTo("Validation Failed");
  }

  @Test
  void shouldReturn200WithEmptyCartWhenCleared() {
    // given
    var cartResponse = new CartResponse(1L, SESSION_ID, List.of(), 0, BigDecimal.ZERO);
    when(cartService.clearCart(SESSION_ID)).thenReturn(cartResponse);

    // when
    var result = mvc.delete().uri("/api/cart").header(SESSION_HEADER, SESSION_ID).exchange();

    // then
    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("id").isEqualTo(1);
    assertThat(result).bodyJson().extractingPath("sessionId").isEqualTo(SESSION_ID);
    assertThat(result).bodyJson().extractingPath("totalItems").isEqualTo(0);
    assertThat(result).bodyJson().extractingPath("totalPrice").isEqualTo(0);
    assertThat(result).bodyJson().extractingPath("items").asList().isEmpty();
  }

  @Test
  void shouldReturn404WhenClearingNonExistentCart() {
    // given
    when(cartService.clearCart(SESSION_ID))
        .thenThrow(new ResourceNotFoundException("Cart not found for session: " + SESSION_ID));

    // when
    var result = mvc.delete().uri("/api/cart").header(SESSION_HEADER, SESSION_ID).exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.NOT_FOUND);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(404);
    assertThat(result)
        .bodyJson()
        .extractingPath("message")
        .isEqualTo("Cart not found for session: " + SESSION_ID);
  }

  @Test
  void shouldReturn400WhenClearCartMissingSessionHeader() {
    // given — no X-CartEntity-Session header

    // when
    var result = mvc.delete().uri("/api/cart").exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(400);
    assertThat(result).bodyJson().extractingPath("error").isEqualTo("Bad Request");
  }

  @Test
  void shouldReturn400WhenInvalidUuidOnAddItem() throws Exception {
    // given
    var requestBody = jsonMapper.writeValueAsString(new AddToCartRequest(1L, 1));

    // when
    var result =
        mvc.post()
            .uri("/api/cart/items")
            .header(SESSION_HEADER, "not-a-uuid")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
  }

  @Test
  void shouldReturn400WhenInvalidUuidOnUpdateItem() throws Exception {
    // given
    var requestBody = jsonMapper.writeValueAsString(new UpdateCartItemRequest(3));

    // when
    var result =
        mvc.put()
            .uri("/api/cart/items/1")
            .header(SESSION_HEADER, "not-a-uuid")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
  }

  @Test
  void shouldReturn400WhenInvalidUuidOnRemoveItem() {
    // when
    var result =
        mvc.delete().uri("/api/cart/items/1").header(SESSION_HEADER, "not-a-uuid").exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
  }

  @Test
  void shouldReturn400WhenInvalidUuidOnClearCart() {
    // when
    var result = mvc.delete().uri("/api/cart").header(SESSION_HEADER, "not-a-uuid").exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
  }
}
