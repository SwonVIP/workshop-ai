package ch.migrosonline.workshop.controller;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.exception.GlobalExceptionHandler;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class GlobalExceptionHandlerTest {

  private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

  @Test
  void shouldReturn404WithStructuredErrorForEntityNotFoundException() {
    // given — an EntityNotFoundException with a descriptive message
    var exception = new EntityNotFoundException("Product with id 42 not found");

    // when — the handler processes it
    var response = handler.handleNotFound(exception);

    // then — returns 404 with structured error body
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().error()).isEqualTo("Not Found");
    assertThat(response.getBody().message()).isEqualTo("Product with id 42 not found");
    assertThat(response.getBody().status()).isEqualTo(404);
  }

  @Test
  void shouldReturn500WithGenericMessageAndNeverLeakInternalDetails() {
    // given — an unexpected runtime exception with sensitive internal details
    var exception = new RuntimeException("Database connection failed: password=secret");

    // when — the handler processes it
    var response = handler.handleGeneric(exception);

    // then — returns 500 with generic message, internal details are NOT exposed
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().error()).isEqualTo("Internal Server Error");
    assertThat(response.getBody().message()).isEqualTo("An unexpected error occurred");
    assertThat(response.getBody().message()).doesNotContain("Database", "password", "secret");
    assertThat(response.getBody().status()).isEqualTo(500);
  }

  @Test
  void shouldReturn404WithNullMessageWhenExceptionMessageIsNull() {
    // given — an EntityNotFoundException with null message
    var exception = new EntityNotFoundException((String) null);

    // when
    var response = handler.handleNotFound(exception);

    // then
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().status()).isEqualTo(404);
    assertThat(response.getBody().error()).isEqualTo("Not Found");
    assertThat(response.getBody().message()).isNull();
  }

  @Test
  void shouldReturn500AndNotLeakStackTraceForNullPointerException() {
    // given — a NullPointerException
    var exception = new NullPointerException("Cannot invoke method on null reference");

    // when
    var response = handler.handleGeneric(exception);

    // then — returns generic 500, does not leak NPE details
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().status()).isEqualTo(500);
    assertThat(response.getBody().error()).isEqualTo("Internal Server Error");
    assertThat(response.getBody().message()).isEqualTo("An unexpected error occurred");
    assertThat(response.getBody().message()).doesNotContain("null", "NullPointer");
  }
}
