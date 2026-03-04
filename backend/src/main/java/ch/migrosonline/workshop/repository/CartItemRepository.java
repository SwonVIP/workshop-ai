package ch.migrosonline.workshop.repository;

import ch.migrosonline.workshop.entity.CartItem;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

  Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
}
