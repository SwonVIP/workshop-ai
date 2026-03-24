package ch.migrosonline.workshop.repository;

import ch.migrosonline.workshop.entity.CouponEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<CouponEntity, Long> {

  Optional<CouponEntity> findByCodeAndActiveTrue(String code);
}
