package ch.migrosonline.workshop.repository;

import ch.migrosonline.workshop.entity.CartEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<CartEntity, Long> {

  @EntityGraph(attributePaths = {"items", "items.product"})
  Optional<CartEntity> findBySessionId(String sessionId);
}
