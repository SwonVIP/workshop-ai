package ch.migrosonline.workshop.service;

import ch.migrosonline.workshop.model.DeliverySlotResponse;
import ch.migrosonline.workshop.repository.DeliverySlotRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeliverySlotService {

  private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

  private final DeliverySlotRepository deliverySlotRepository;

  @Transactional(readOnly = true)
  public List<DeliverySlotResponse> getAvailableSlots() {
    var today = LocalDate.now();
    return deliverySlotRepository.findAllByOrderByDateAscStartTimeAsc().stream()
        .map(
            slot ->
                new DeliverySlotResponse(
                    slot.getId(),
                    slot.getDate(),
                    computeDayLabel(slot.getDate(), today),
                    slot.getStartTime().format(TIME_FORMATTER),
                    slot.getEndTime().format(TIME_FORMATTER),
                    slot.getPrice()))
        .toList();
  }

  private String computeDayLabel(LocalDate slotDate, LocalDate today) {
    if (slotDate.equals(today)) {
      return "Today";
    } else if (slotDate.equals(today.plusDays(1))) {
      return "Tomorrow";
    } else {
      return slotDate.getDayOfWeek().name().charAt(0)
          + slotDate.getDayOfWeek().name().substring(1).toLowerCase();
    }
  }
}
