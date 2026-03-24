package ch.migrosonline.workshop.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.entity.CustomerEntity;
import ch.migrosonline.workshop.entity.OrderEntity;
import ch.migrosonline.workshop.exception.ConflictException;
import ch.migrosonline.workshop.model.RegisterRequest;
import ch.migrosonline.workshop.repository.CustomerRepository;
import ch.migrosonline.workshop.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

  @Mock private CustomerRepository customerRepository;
  @Mock private OrderRepository orderRepository;
  @Mock private PasswordEncoder passwordEncoder;

  @InjectMocks private CustomerService customerService;

  private RegisterRequest validRequest() {
    return new RegisterRequest("john@example.com", "securePassword123", 1L);
  }

  private OrderEntity sampleOrder() {
    return OrderEntity.builder()
        .id(1L)
        .orderNumber("ORD-20260306-ABC1234")
        .sessionId("test-session")
        .firstName("John")
        .lastName("Doe")
        .email("john@example.com")
        .phone("+41791234567")
        .street("Bahnhofstrasse 1")
        .apartment("3A")
        .city("Zurich")
        .postalCode("8001")
        .build();
  }

  @Test
  void shouldRegisterCustomerSuccessfully() {
    // given
    var order = sampleOrder();
    when(customerRepository.existsByEmail("john@example.com")).thenReturn(false);
    when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
    when(passwordEncoder.encode("securePassword123")).thenReturn("$2a$10$hashedpassword");
    when(customerRepository.save(any(CustomerEntity.class)))
        .thenAnswer(
            invocation -> {
              var entity = (CustomerEntity) invocation.getArgument(0);
              return CustomerEntity.builder()
                  .id(1L)
                  .email(entity.getEmail())
                  .passwordHash(entity.getPasswordHash())
                  .firstName(entity.getFirstName())
                  .lastName(entity.getLastName())
                  .phone(entity.getPhone())
                  .street(entity.getStreet())
                  .apartment(entity.getApartment())
                  .city(entity.getCity())
                  .postalCode(entity.getPostalCode())
                  .build();
            });

    // when
    var result = customerService.register(validRequest());

    // then
    assertThat(result.id()).isEqualTo(1L);
    assertThat(result.email()).isEqualTo("john@example.com");
    assertThat(result.firstName()).isEqualTo("John");
    assertThat(result.lastName()).isEqualTo("Doe");
    assertThat(result.phone()).isEqualTo("+41791234567");
    assertThat(result.street()).isEqualTo("Bahnhofstrasse 1");
    assertThat(result.apartment()).isEqualTo("3A");
    assertThat(result.city()).isEqualTo("Zurich");
    assertThat(result.postalCode()).isEqualTo("8001");
  }

  @Test
  void shouldHashPasswordWithBCrypt() {
    // given
    var order = sampleOrder();
    when(customerRepository.existsByEmail("john@example.com")).thenReturn(false);
    when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
    when(passwordEncoder.encode("securePassword123")).thenReturn("$2a$10$hashedpassword");
    when(customerRepository.save(any(CustomerEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // when
    customerService.register(validRequest());

    // then
    verify(passwordEncoder).encode("securePassword123");
    var captor = ArgumentCaptor.forClass(CustomerEntity.class);
    verify(customerRepository).save(captor.capture());
    assertThat(captor.getValue().getPasswordHash()).isEqualTo("$2a$10$hashedpassword");
  }

  @Test
  void shouldCopyAddressFieldsFromOrder() {
    // given
    var order = sampleOrder();
    when(customerRepository.existsByEmail("john@example.com")).thenReturn(false);
    when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
    when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hashed");
    when(customerRepository.save(any(CustomerEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // when
    customerService.register(validRequest());

    // then
    var captor = ArgumentCaptor.forClass(CustomerEntity.class);
    verify(customerRepository).save(captor.capture());
    var saved = captor.getValue();
    assertThat(saved.getFirstName()).isEqualTo(order.getFirstName());
    assertThat(saved.getLastName()).isEqualTo(order.getLastName());
    assertThat(saved.getPhone()).isEqualTo(order.getPhone());
    assertThat(saved.getStreet()).isEqualTo(order.getStreet());
    assertThat(saved.getApartment()).isEqualTo(order.getApartment());
    assertThat(saved.getCity()).isEqualTo(order.getCity());
    assertThat(saved.getPostalCode()).isEqualTo(order.getPostalCode());
  }

  @Test
  void shouldThrowConflictWhenEmailAlreadyExists() {
    when(customerRepository.existsByEmail("john@example.com")).thenReturn(true);

    assertThatThrownBy(() -> customerService.register(validRequest()))
        .isInstanceOf(ConflictException.class)
        .hasMessageContaining("An account with this email already exists");
  }

  @Test
  void shouldThrowNotFoundWhenOrderDoesNotExist() {
    when(customerRepository.existsByEmail("john@example.com")).thenReturn(false);
    when(orderRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> customerService.register(validRequest()))
        .isInstanceOf(EntityNotFoundException.class)
        .hasMessageContaining("Order not found");
  }

  // --- identify tests ---

  @Test
  void identifyShouldReturnCustomerWhenCredentialsAreValid() {
    // given
    var customer =
        CustomerEntity.builder()
            .id(1L)
            .email("john@example.com")
            .passwordHash("$2a$10$hashedpassword")
            .firstName("John")
            .lastName("Doe")
            .phone("+41791234567")
            .street("Bahnhofstrasse 1")
            .apartment("3A")
            .city("Zurich")
            .postalCode("8001")
            .build();
    when(customerRepository.findByEmail("john@example.com")).thenReturn(Optional.of(customer));
    when(passwordEncoder.matches("securePassword123", "$2a$10$hashedpassword")).thenReturn(true);

    // when
    var result = customerService.identify("john@example.com", "securePassword123");

    // then
    assertThat(result.id()).isEqualTo(1L);
    assertThat(result.email()).isEqualTo("john@example.com");
    assertThat(result.firstName()).isEqualTo("John");
    assertThat(result.lastName()).isEqualTo("Doe");
    assertThat(result.phone()).isEqualTo("+41791234567");
    assertThat(result.street()).isEqualTo("Bahnhofstrasse 1");
    assertThat(result.apartment()).isEqualTo("3A");
    assertThat(result.city()).isEqualTo("Zurich");
    assertThat(result.postalCode()).isEqualTo("8001");
  }

  @Test
  void identifyShouldThrowNotFoundWhenPasswordIsWrong() {
    // given
    var customer =
        CustomerEntity.builder()
            .id(1L)
            .email("john@example.com")
            .passwordHash("$2a$10$hashedpassword")
            .build();
    when(customerRepository.findByEmail("john@example.com")).thenReturn(Optional.of(customer));
    when(passwordEncoder.matches("wrongPassword", "$2a$10$hashedpassword")).thenReturn(false);

    // when/then
    assertThatThrownBy(() -> customerService.identify("john@example.com", "wrongPassword"))
        .isInstanceOf(EntityNotFoundException.class)
        .hasMessageContaining("Invalid email or password");
  }

  @Test
  void identifyShouldThrowNotFoundWhenEmailIsUnknown() {
    // given
    when(customerRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

    // when/then
    assertThatThrownBy(() -> customerService.identify("unknown@example.com", "anyPassword"))
        .isInstanceOf(EntityNotFoundException.class)
        .hasMessageContaining("Invalid email or password");
  }

  // --- updateAddress tests ---

  @Test
  void updateAddressShouldUpdateAllAddressFields() {
    // given
    var customer =
        CustomerEntity.builder()
            .id(1L)
            .email("john@example.com")
            .passwordHash("$2a$10$hashed")
            .firstName("John")
            .lastName("Doe")
            .phone("+41791234567")
            .street("Old Street 1")
            .apartment("1A")
            .city("Bern")
            .postalCode("3000")
            .build();
    when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
    when(customerRepository.save(any(CustomerEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // when
    customerService.updateAddress(
        1L, "Jane", "Smith", "+41797654321", "New Street 42", "5B", "Zurich", "8001");

    // then
    var captor = ArgumentCaptor.forClass(CustomerEntity.class);
    verify(customerRepository).save(captor.capture());
    var saved = captor.getValue();
    assertThat(saved.getFirstName()).isEqualTo("Jane");
    assertThat(saved.getLastName()).isEqualTo("Smith");
    assertThat(saved.getPhone()).isEqualTo("+41797654321");
    assertThat(saved.getStreet()).isEqualTo("New Street 42");
    assertThat(saved.getApartment()).isEqualTo("5B");
    assertThat(saved.getCity()).isEqualTo("Zurich");
    assertThat(saved.getPostalCode()).isEqualTo("8001");
  }

  @Test
  void updateAddressShouldThrowNotFoundWhenCustomerDoesNotExist() {
    // given
    when(customerRepository.findById(99L)).thenReturn(Optional.empty());

    // when/then
    assertThatThrownBy(
            () ->
                customerService.updateAddress(
                    99L, "Jane", "Smith", "+41797654321", "Street 1", null, "Zurich", "8001"))
        .isInstanceOf(EntityNotFoundException.class)
        .hasMessageContaining("Customer not found: 99");
  }
}
