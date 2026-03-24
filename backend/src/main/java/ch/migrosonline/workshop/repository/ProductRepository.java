package ch.migrosonline.workshop.repository;

import ch.migrosonline.workshop.entity.ProductEntity;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository
    extends JpaRepository<ProductEntity, Long>, JpaSpecificationExecutor<ProductEntity> {

  List<ProductEntity> findByCategoryIdInAndIdNotIn(
      Collection<Long> categoryIds, Collection<Long> excludedProductIds);
}
