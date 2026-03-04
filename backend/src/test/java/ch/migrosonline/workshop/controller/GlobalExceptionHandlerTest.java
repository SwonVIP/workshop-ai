package ch.migrosonline.workshop.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.exception.GlobalExceptionHandler;
import ch.migrosonline.workshop.exception.ResourceNotFoundException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

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

  @Test
  void shouldReturn400WithFieldErrorsWhenValidationFails() {
    // given — a MethodArgumentNotValidException with field errors
    var exception = mock(MethodArgumentNotValidException.class);
    var bindingResult = mock(BindingResult.class);
    var fieldError = new FieldError("product", "name", "must not be blank");
    when(exception.getBindingResult()).thenReturn(bindingResult);
    when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

    // when
    var response = handler.handleValidation(exception);

    // then
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().get("status")).isEqualTo(400);
    assertThat(response.getBody().get("error")).isEqualTo("Validation Failed");
    @SuppressWarnings("unchecked")
    var fieldErrors = (java.util.Map<String, String>) response.getBody().get("fieldErrors");
    assertThat(fieldErrors).containsEntry("name", "must not be blank");
  }

  @Test
  void shouldReturn400WithFallbackMessageWhenFieldErrorHasNullMessage() {
    // given — a field error with null defaultMessage
    var exception = mock(MethodArgumentNotValidException.class);
    var bindingResult = mock(BindingResult.class);
    var fieldError = new FieldError("product", "price", null);
    when(exception.getBindingResult()).thenReturn(bindingResult);
    when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

    // when
    var response = handler.handleValidation(exception);

    // then — falls back to "invalid"
    assertThat(response.getBody()).isNotNull();
    @SuppressWarnings("unchecked")
    var fieldErrors = (java.util.Map<String, String>) response.getBody().get("fieldErrors");
    assertThat(fieldErrors).containsEntry("price", "invalid");
  }

  @Test
  void shouldReturn400WithFirstErrorWhenMultipleErrorsOnSameField() {
    // given — two field errors on the same field
    var exception = mock(MethodArgumentNotValidException.class);
    var bindingResult = mock(BindingResult.class);
    var first = new FieldError("product", "name", "must not be blank");
    var second = new FieldError("product", "name", "size must be between 1 and 255");
    when(exception.getBindingResult()).thenReturn(bindingResult);
    when(bindingResult.getFieldErrors()).thenReturn(List.of(first, second));

    // when
    var response = handler.handleValidation(exception);

    // then — merge function keeps first
    assertThat(response.getBody()).isNotNull();
    @SuppressWarnings("unchecked")
    var fieldErrors = (java.util.Map<String, String>) response.getBody().get("fieldErrors");
    assertThat(fieldErrors).containsEntry("name", "must not be blank");
  }

  @Test
  void shouldReturn404WithNullMessageWhenExceptionMessageIsNull() {
    // given — a ResourceNotFoundException with null message
    var exception = new ResourceNotFoundException(null);

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
