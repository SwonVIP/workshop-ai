package ch.migrosonline.workshop.model;

import jakarta.validation.constraints.NotBlank;

public record CouponValidateRequest(@NotBlank String code) {}
