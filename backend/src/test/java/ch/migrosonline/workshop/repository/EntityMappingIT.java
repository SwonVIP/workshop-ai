package ch.migrosonline.workshop.repository;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.entity.CategoryEntity;
import ch.migrosonline.workshop.entity.ProductEntity;
import ch.migrosonline.workshop.support.RepositoryTestSupport;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class EntityMappingIT extends RepositoryTestSupport {

  @Autowired private EntityManager entityManager;

  @Test
  void shouldMapCategoryEntityToDatabase() {
    // given — seed data loaded by Flyway

    // when — loading category by id
    var category = entityManager.find(CategoryEntity.class, 1L);

    // then — entity fields are correctly mapped
    assertThat(category).isNotNull();
    assertThat(category.getId()).isEqualTo(1L);
    assertThat(category.getName()).isEqualTo("Electronics");
    assertThat(category.getDescription()).isNotBlank();
  }

  @Test
  void shouldMapProductEntityWithLazyCategory() {
    // given — seed data loaded by Flyway

    // when — loading product by id
    var product = entityManager.find(ProductEntity.class, 1L);

    // then — product fields are correctly mapped including lazy-loaded category
    assertThat(product).isNotNull();
    assertThat(product.getId()).isEqualTo(1L);
    assertThat(product.getName()).isNotBlank();
    assertThat(product.getPrice()).isNotNull();
    assertThat(product.getCategory()).isNotNull();
    assertThat(product.getCategory().getName()).isNotBlank();
  }

  @Test
  void shouldMapProductImageUrlColumn() {
    // given — seed data with image URLs

    // when — loading first product
    var product = entityManager.find(ProductEntity.class, 1L);

    // then — imageUrl is mapped from image_url column
    assertThat(product.getImageUrl()).startsWith("https://placehold.co/");
  }
}
