package ch.migrosonline.workshop.controller;

import ch.migrosonline.workshop.model.DeliverySlotResponse;
import ch.migrosonline.workshop.service.DeliverySlotService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/delivery-slots")
@RequiredArgsConstructor
public class DeliverySlotController {

  private final DeliverySlotService deliverySlotService;

  @GetMapping
  public List<DeliverySlotResponse> getAvailableSlots() {
    return deliverySlotService.getAvailableSlots();
  }
}
