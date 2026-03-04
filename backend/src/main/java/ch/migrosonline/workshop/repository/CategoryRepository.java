package ch.migrosonline.workshop.repository;

import ch.migrosonline.workshop.entity.CategoryEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

  List<CategoryEntity> findAllByOrderByNameAsc();
}
