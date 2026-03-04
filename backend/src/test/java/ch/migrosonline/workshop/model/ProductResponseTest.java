package ch.migrosonline.workshop.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ch.migrosonline.workshop.entity.CategoryEntity;
import ch.migrosonline.workshop.entity.ProductEntity;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class ProductResponseTest {

  @Test
  void shouldMapProductEntityToResponseWithCategory() {
    // given
    var category =
        CategoryEntity.builder().id(1L).name("Electronics").description("Gadgets").build();
    var entity =
        ProductEntity.builder()
            .id(10L)
            .name("Wireless Headphones")
            .description("Noise cancelling")
            .price(new BigDecimal("89.99"))
            .imageUrl("https://placehold.co/400x300?text=Headphones")
            .category(category)
            .createdAt(Instant.parse("2026-03-03T09:00:00Z"))
            .build();

    // when
    var response = ProductResponse.from(entity);

    // then
    assertThat(response.id()).isEqualTo(10L);
    assertThat(response.name()).isEqualTo("Wireless Headphones");
    assertThat(response.description()).isEqualTo("Noise cancelling");
    assertThat(response.price()).isEqualTo(new BigDecimal("89.99"));
    assertThat(response.imageUrl()).isEqualTo("https://placehold.co/400x300?text=Headphones");
    assertThat(response.category()).isNotNull();
    assertThat(response.category().id()).isEqualTo(1L);
    assertThat(response.category().name()).isEqualTo("Electronics");
  }

  @Test
  void shouldHandleNullOptionalFields() {
    // given
    var category = CategoryEntity.builder().id(1L).name("Books").description(null).build();
    var entity =
        ProductEntity.builder()
            .id(20L)
            .name("Clean Code")
            .description(null)
            .price(new BigDecimal("44.99"))
            .imageUrl(null)
            .category(category)
            .createdAt(null)
            .build();

    // when
    var response = ProductResponse.from(entity);

    // then
    assertThat(response.description()).isNull();
    assertThat(response.imageUrl()).isNull();
  }

  @Test
  void shouldThrowNullPointerExceptionWhenCategoryIsNull() {
    // given — product with null category
    var entity =
        ProductEntity.builder()
            .id(30L)
            .name("Orphan ProductEntity")
            .description("No category")
            .price(new BigDecimal("9.99"))
            .imageUrl(null)
            .category(null)
            .createdAt(Instant.now())
            .build();

    // when/then — NPE because CategoryResponse.from() calls entity.getCategory().getId()
    assertThatThrownBy(() -> ProductResponse.from(entity)).isInstanceOf(NullPointerException.class);
  }

  @Test
  void shouldMapProductWithZeroPrice() {
    // given
    var category = CategoryEntity.builder().id(1L).name("Free").description("Free items").build();
    var entity =
        ProductEntity.builder()
            .id(40L)
            .name("Free Sample")
            .description("Complimentary")
            .price(BigDecimal.ZERO)
            .imageUrl(null)
            .category(category)
            .createdAt(Instant.now())
            .build();

    // when
    var response = ProductResponse.from(entity);

    // then
    assertThat(response.price()).isEqualByComparingTo(BigDecimal.ZERO);
  }

  @Test
  void shouldMapProductWithNullId() {
    // given — unsaved entity with null id
    var category = CategoryEntity.builder().id(1L).name("Books").description("Reading").build();
    var entity =
        ProductEntity.builder()
            .id(null)
            .name("Draft Book")
            .description("Unpublished")
            .price(new BigDecimal("15.00"))
            .imageUrl(null)
            .category(category)
            .createdAt(null)
            .build();

    // when
    var response = ProductResponse.from(entity);

    // then
    assertThat(response.id()).isNull();
    assertThat(response.name()).isEqualTo("Draft Book");
  }
}
