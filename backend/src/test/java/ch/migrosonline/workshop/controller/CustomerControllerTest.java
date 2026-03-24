package ch.migrosonline.workshop.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.exception.ConflictException;
import ch.migrosonline.workshop.model.CustomerResponse;
import ch.migrosonline.workshop.model.RegisterRequest;
import ch.migrosonline.workshop.service.CustomerService;
import ch.migrosonline.workshop.support.ControllerTestSupport;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(CustomerController.class)
class CustomerControllerTest extends ControllerTestSupport {

  @MockitoBean private CustomerService customerService;

  private CustomerResponse sampleCustomerResponse() {
    return new CustomerResponse(
        1L,
        "john@example.com",
        "John",
        "Doe",
        "+41791234567",
        "Bahnhofstrasse 1",
        "3A",
        "Zurich",
        "8001");
  }

  @Test
  void shouldRegisterCustomerAndReturn201() {
    when(customerService.register(any(RegisterRequest.class))).thenReturn(sampleCustomerResponse());

    var result =
        mvc.post()
            .uri("/api/customers/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "email": "john@example.com",
                  "password": "securePassword123",
                  "orderId": 1
                }
                """)
            .exchange();

    assertThat(result).hasStatus(201);
    assertThat(result).bodyJson().extractingPath("email").isEqualTo("john@example.com");
    assertThat(result).bodyJson().extractingPath("firstName").isEqualTo("John");
    assertThat(result).bodyJson().extractingPath("lastName").isEqualTo("Doe");
  }

  @Test
  void shouldReturn409WhenEmailAlreadyExists() {
    when(customerService.register(any(RegisterRequest.class)))
        .thenThrow(new ConflictException("An account with this email already exists"));

    var result =
        mvc.post()
            .uri("/api/customers/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "email": "john@example.com",
                  "password": "securePassword123",
                  "orderId": 1
                }
                """)
            .exchange();

    assertThat(result).hasStatus(409);
  }

  @Test
  void shouldReturn404WhenOrderNotFound() {
    when(customerService.register(any(RegisterRequest.class)))
        .thenThrow(new EntityNotFoundException("Order not found: 999"));

    var result =
        mvc.post()
            .uri("/api/customers/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "email": "john@example.com",
                  "password": "securePassword123",
                  "orderId": 999
                }
                """)
            .exchange();

    assertThat(result).hasStatus(404);
  }

  @Test
  void shouldReturn400WhenRequiredFieldsMissing() {
    var result =
        mvc.post()
            .uri("/api/customers/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}")
            .exchange();

    assertThat(result).hasStatus(400);
  }

  // --- identify tests ---

  @Test
  void identifyShouldReturn200WithCustomerOnSuccess() {
    when(customerService.identify("john@example.com", "securePassword123"))
        .thenReturn(sampleCustomerResponse());

    var result =
        mvc.post()
            .uri("/api/customers/identify")
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "email": "john@example.com",
                  "password": "securePassword123"
                }
                """)
            .exchange();

    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("email").isEqualTo("john@example.com");
    assertThat(result).bodyJson().extractingPath("firstName").isEqualTo("John");
    assertThat(result).bodyJson().extractingPath("lastName").isEqualTo("Doe");
  }

  @Test
  void identifyShouldReturn404WhenPasswordIsWrong() {
    when(customerService.identify("john@example.com", "wrongPassword"))
        .thenThrow(new EntityNotFoundException("Invalid email or password"));

    var result =
        mvc.post()
            .uri("/api/customers/identify")
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "email": "john@example.com",
                  "password": "wrongPassword"
                }
                """)
            .exchange();

    assertThat(result).hasStatus(404);
  }

  @Test
  void identifyShouldReturn404WhenEmailIsUnknown() {
    when(customerService.identify("unknown@example.com", "anyPassword"))
        .thenThrow(new EntityNotFoundException("Invalid email or password"));

    var result =
        mvc.post()
            .uri("/api/customers/identify")
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "email": "unknown@example.com",
                  "password": "anyPassword"
                }
                """)
            .exchange();

    assertThat(result).hasStatus(404);
  }

  @Test
  void identifyShouldReturn400WhenRequiredFieldsMissing() {
    var result =
        mvc.post()
            .uri("/api/customers/identify")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}")
            .exchange();

    assertThat(result).hasStatus(400);
  }
}
