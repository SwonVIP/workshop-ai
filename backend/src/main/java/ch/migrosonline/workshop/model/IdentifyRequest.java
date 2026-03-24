package ch.migrosonline.workshop.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record IdentifyRequest(@NotBlank @Email String email, @NotBlank String password) {}
