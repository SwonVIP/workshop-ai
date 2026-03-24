package ch.migrosonline.workshop.repository;

import ch.migrosonline.workshop.entity.DeliverySlotEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliverySlotRepository extends JpaRepository<DeliverySlotEntity, Long> {

  List<DeliverySlotEntity> findAllByOrderByDateAscStartTimeAsc();
}
