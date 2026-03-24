package ch.migrosonline.workshop.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DeliverySlotResponse(
    Long id, LocalDate date, String dayLabel, String startTime, String endTime, BigDecimal price) {}
