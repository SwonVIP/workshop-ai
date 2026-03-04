package ch.migrosonline.workshop.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ch.migrosonline.workshop.entity.Category;
import org.junit.jupiter.api.Test;

class CategoryResponseTest {

  @Test
  void shouldMapCategoryEntityToResponse() {
    // given
    var entity = Category.builder().id(1L).name("Electronics").description("Gadgets").build();

    // when
    var response = CategoryResponse.from(entity);

    // then
    assertThat(response.id()).isEqualTo(1L);
    assertThat(response.name()).isEqualTo("Electronics");
    assertThat(response.description()).isEqualTo("Gadgets");
  }

  @Test
  void shouldHandleNullDescription() {
    // given
    var entity = Category.builder().id(2L).name("Books").description(null).build();

    // when
    var response = CategoryResponse.from(entity);

    // then
    assertThat(response.description()).isNull();
  }

  @Test
  void shouldThrowNullPointerExceptionWhenEntityIsNull() {
    // given — null entity

    // when/then — NPE because from() calls entity.getId() on null
    assertThatThrownBy(() -> CategoryResponse.from(null)).isInstanceOf(NullPointerException.class);
  }

  @Test
  void shouldMapCategoryWithNullName() {
    // given
    var entity = Category.builder().id(3L).name(null).description("Unnamed").build();

    // when
    var response = CategoryResponse.from(entity);

    // then
    assertThat(response.id()).isEqualTo(3L);
    assertThat(response.name()).isNull();
    assertThat(response.description()).isEqualTo("Unnamed");
  }
}
