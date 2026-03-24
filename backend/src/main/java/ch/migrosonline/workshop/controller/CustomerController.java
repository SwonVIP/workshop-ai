package ch.migrosonline.workshop.controller;

import ch.migrosonline.workshop.model.CustomerResponse;
import ch.migrosonline.workshop.model.IdentifyRequest;
import ch.migrosonline.workshop.model.RegisterRequest;
import ch.migrosonline.workshop.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

  private final CustomerService customerService;

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public CustomerResponse register(@Valid @RequestBody RegisterRequest request) {
    return customerService.register(request);
  }

  @PostMapping("/identify")
  public CustomerResponse identify(@Valid @RequestBody IdentifyRequest request) {
    return customerService.identify(request.email(), request.password());
  }
}
