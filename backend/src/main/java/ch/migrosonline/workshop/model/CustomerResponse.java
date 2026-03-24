package ch.migrosonline.workshop.model;

public record CustomerResponse(
    Long id,
    String email,
    String firstName,
    String lastName,
    String phone,
    String street,
    String apartment,
    String city,
    String postalCode) {}
