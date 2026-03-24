package ch.migrosonline.workshop.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.model.DeliverySlotResponse;
import ch.migrosonline.workshop.service.DeliverySlotService;
import ch.migrosonline.workshop.support.ControllerTestSupport;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(DeliverySlotController.class)
class DeliverySlotControllerTest extends ControllerTestSupport {

  @MockitoBean private DeliverySlotService deliverySlotService;

  @Test
  void shouldReturnAvailableDeliverySlots() {
    // given
    var today = LocalDate.now();
    var slots =
        List.of(
            new DeliverySlotResponse(1L, today, "Today", "08:00", "10:00", new BigDecimal("9.90")),
            new DeliverySlotResponse(2L, today, "Today", "10:00", "12:00", new BigDecimal("9.90")),
            new DeliverySlotResponse(3L, today, "Today", "12:00", "14:00", new BigDecimal("7.90")));
    when(deliverySlotService.getAvailableSlots()).thenReturn(slots);

    // when
    var result = mvc.get().uri("/api/delivery-slots").exchange();

    // then
    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("$").asList().hasSize(3);
    assertThat(result).bodyJson().extractingPath("[0].id").isEqualTo(1);
    assertThat(result).bodyJson().extractingPath("[0].dayLabel").isEqualTo("Today");
    assertThat(result).bodyJson().extractingPath("[0].startTime").isEqualTo("08:00");
    assertThat(result).bodyJson().extractingPath("[0].endTime").isEqualTo("10:00");
    assertThat(result).bodyJson().extractingPath("[0].price").isEqualTo(9.90);
  }

  @Test
  void shouldReturnEmptyListWhenNoSlotsAvailable() {
    // given
    when(deliverySlotService.getAvailableSlots()).thenReturn(List.of());

    // when
    var result = mvc.get().uri("/api/delivery-slots").exchange();

    // then
    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("$").asList().isEmpty();
  }

  @Test
  void shouldReturnSlotsWithDifferentDayLabels() {
    // given
    var today = LocalDate.now();
    var tomorrow = today.plusDays(1);
    var dayAfter = today.plusDays(2);
    var dayAfterLabel =
        dayAfter.getDayOfWeek().name().charAt(0)
            + dayAfter.getDayOfWeek().name().substring(1).toLowerCase();
    var slots =
        List.of(
            new DeliverySlotResponse(1L, today, "Today", "08:00", "10:00", new BigDecimal("9.90")),
            new DeliverySlotResponse(
                7L, tomorrow, "Tomorrow", "08:00", "10:00", new BigDecimal("9.90")),
            new DeliverySlotResponse(
                13L, dayAfter, dayAfterLabel, "08:00", "10:00", new BigDecimal("9.90")));
    when(deliverySlotService.getAvailableSlots()).thenReturn(slots);

    // when
    var result = mvc.get().uri("/api/delivery-slots").exchange();

    // then
    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("[0].dayLabel").isEqualTo("Today");
    assertThat(result).bodyJson().extractingPath("[1].dayLabel").isEqualTo("Tomorrow");
    assertThat(result).bodyJson().extractingPath("[2].dayLabel").isEqualTo(dayAfterLabel);
  }

  @Test
  void shouldReturn500WhenServiceThrowsUnexpectedException() {
    // given
    when(deliverySlotService.getAvailableSlots())
        .thenThrow(new RuntimeException("Unexpected failure"));

    // when
    var result = mvc.get().uri("/api/delivery-slots").exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(500);
    assertThat(result).bodyJson().extractingPath("error").isEqualTo("Internal Server Error");
  }
}
