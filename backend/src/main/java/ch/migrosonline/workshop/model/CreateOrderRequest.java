package ch.migrosonline.workshop.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateOrderRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotBlank @Email String email,
    @NotBlank String phone,
    @NotBlank String street,
    String apartment,
    @NotBlank String city,
    @NotBlank @Pattern(regexp = "\\d{4}") String postalCode,
    String deliveryInstructions,
    @NotNull Long deliverySlotId,
    String couponCode) {}
