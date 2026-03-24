package ch.migrosonline.workshop.model;

import java.math.BigDecimal;

public record CouponResponse(String code, String type, BigDecimal value, String description) {}
