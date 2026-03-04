package ch.migrosonline.workshop.controller;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.exception.GlobalExceptionHandler;
import ch.migrosonline.workshop.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class GlobalExceptionHandlerTest {

  private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

  @Test
  void shouldReturn404WithStructuredErrorForResourceNotFoundException() {
    // given — a ResourceNotFoundException with a descriptive message
    var exception = new ResourceNotFoundException("Product with id 42 not found");

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
}
