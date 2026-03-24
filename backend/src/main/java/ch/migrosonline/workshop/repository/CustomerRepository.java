package ch.migrosonline.workshop.repository;

import ch.migrosonline.workshop.entity.CustomerEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {

  Optional<CustomerEntity> findByEmail(String email);

  boolean existsByEmail(String email);
}
