package ch.migrosonline.workshop.mapper;

import ch.migrosonline.workshop.entity.DeliverySlotEntity;
import ch.migrosonline.workshop.entity.OrderEntity;
import ch.migrosonline.workshop.entity.OrderItemEntity;
import ch.migrosonline.workshop.model.DeliverySlotResponse;
import ch.migrosonline.workshop.model.OrderItemResponse;
import ch.migrosonline.workshop.model.OrderResponse;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

  public OrderResponse toResponse(OrderEntity order) {
    var slot = order.getDeliverySlot();
    var slotResponse = toSlotResponse(slot);
    var items = order.getItems().stream().map(this::toItemResponse).toList();
    return new OrderResponse(
        order.getId(),
        order.getOrderNumber(),
        order.getStatus(),
        order.getFirstName(),
        order.getLastName(),
        order.getEmail(),
        order.getPhone(),
        order.getStreet(),
        order.getApartment(),
        order.getCity(),
        order.getPostalCode(),
        order.getDeliveryInstructions(),
        slotResponse,
        items,
        order.getSubtotal(),
        order.getDeliveryFee(),
        order.getDiscount(),
        order.getCouponCode(),
        order.getTotal(),
        order.getCreatedAt());
  }

  private DeliverySlotResponse toSlotResponse(DeliverySlotEntity slot) {
    var today = LocalDate.now();
    String dayLabel;
    if (slot.getDate().equals(today)) {
      dayLabel = "Today";
    } else if (slot.getDate().equals(today.plusDays(1))) {
      dayLabel = "Tomorrow";
    } else {
      dayLabel = slot.getDate().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
    }
    return new DeliverySlotResponse(
        slot.getId(),
        slot.getDate(),
        dayLabel,
        slot.getStartTime().toString(),
        slot.getEndTime().toString(),
        slot.getPrice());
  }

  private OrderItemResponse toItemResponse(OrderItemEntity item) {
    return new OrderItemResponse(
        item.getProductName(),
        item.getImageUrl(),
        item.getQuantity(),
        item.getUnitPrice(),
        item.getSubtotal());
  }
}
