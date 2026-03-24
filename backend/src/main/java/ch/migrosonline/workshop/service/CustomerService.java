package ch.migrosonline.workshop.service;

import ch.migrosonline.workshop.entity.CustomerEntity;
import ch.migrosonline.workshop.exception.ConflictException;
import ch.migrosonline.workshop.model.CustomerResponse;
import ch.migrosonline.workshop.model.RegisterRequest;
import ch.migrosonline.workshop.repository.CustomerRepository;
import ch.migrosonline.workshop.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

  private final CustomerRepository customerRepository;
  private final OrderRepository orderRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional
  public CustomerResponse register(RegisterRequest request) {
    if (customerRepository.existsByEmail(request.email())) {
      throw new ConflictException("An account with this email already exists");
    }

    var order =
        orderRepository
            .findById(request.orderId())
            .orElseThrow(
                () -> new EntityNotFoundException("Order not found: " + request.orderId()));

    var customer =
        CustomerEntity.builder()
            .email(request.email())
            .passwordHash(passwordEncoder.encode(request.password()))
            .firstName(order.getFirstName())
            .lastName(order.getLastName())
            .phone(order.getPhone())
            .street(order.getStreet())
            .apartment(order.getApartment())
            .city(order.getCity())
            .postalCode(order.getPostalCode())
            .build();

    var saved = customerRepository.save(customer);

    return new CustomerResponse(
        saved.getId(),
        saved.getEmail(),
        saved.getFirstName(),
        saved.getLastName(),
        saved.getPhone(),
        saved.getStreet(),
        saved.getApartment(),
        saved.getCity(),
        saved.getPostalCode());
  }

  @Transactional
  public void updateAddress(
      Long customerId,
      String firstName,
      String lastName,
      String phone,
      String street,
      String apartment,
      String city,
      String postalCode) {
    var customer =
        customerRepository
            .findById(customerId)
            .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + customerId));

    customer.setFirstName(firstName);
    customer.setLastName(lastName);
    customer.setPhone(phone);
    customer.setStreet(street);
    customer.setApartment(apartment);
    customer.setCity(city);
    customer.setPostalCode(postalCode);

    customerRepository.save(customer);
  }

  public CustomerResponse identify(String email, String password) {
    var customer =
        customerRepository
            .findByEmail(email)
            .filter(c -> passwordEncoder.matches(password, c.getPasswordHash()))
            .orElseThrow(() -> new EntityNotFoundException("Invalid email or password"));

    return new CustomerResponse(
        customer.getId(),
        customer.getEmail(),
        customer.getFirstName(),
        customer.getLastName(),
        customer.getPhone(),
        customer.getStreet(),
        customer.getApartment(),
        customer.getCity(),
        customer.getPostalCode());
  }
}
