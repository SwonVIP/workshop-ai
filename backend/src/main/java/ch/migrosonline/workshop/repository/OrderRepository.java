package ch.migrosonline.workshop.repository;

import ch.migrosonline.workshop.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {}
