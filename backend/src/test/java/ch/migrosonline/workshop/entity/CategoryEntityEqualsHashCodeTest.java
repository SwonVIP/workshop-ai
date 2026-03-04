package ch.migrosonline.workshop.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CategoryEntityEqualsHashCodeTest {

  @Test
  void shouldConsiderTwoCategoriesWithSameNameAsTheSameCategory() {
    // given — two category instances loaded from different queries but same business name
    var electronics1 =
        CategoryEntity.builder().id(1L).name("Electronics").description("v1").build();
    var electronics2 =
        CategoryEntity.builder().id(2L).name("Electronics").description("v2").build();

    // then — they represent the same category
    assertThat(electronics1).isEqualTo(electronics2);
    assertThat(electronics1.hashCode()).isEqualTo(electronics2.hashCode());
  }

  @Test
  void shouldConsiderCategoriesWithDifferentNamesAsDifferentCategories() {
    // given
    var electronics = CategoryEntity.builder().id(1L).name("Electronics").build();
    var clothing = CategoryEntity.builder().id(2L).name("Clothing").build();

    // then
    assertThat(electronics).isNotEqualTo(clothing);
    assertThat(electronics.hashCode()).isNotEqualTo(clothing.hashCode());
  }

  @Test
  void shouldNotMatchCategoryWithNull() {
    // given
    var electronics = CategoryEntity.builder().id(1L).name("Electronics").build();

    // then
    assertThat(electronics).isNotEqualTo(null);
  }

  @Test
  void shouldNotMatchCategoryWithDifferentObjectType() {
    // given
    var electronics = CategoryEntity.builder().id(1L).name("Electronics").build();

    // then
    assertThat(electronics.equals("Electronics")).isFalse();
  }

  @Test
  void shouldNotMatchWhenCategoryNameIsNull() {
    // given — a transient category not yet persisted with no name
    var transient1 = CategoryEntity.builder().id(null).name(null).build();
    var electronics = CategoryEntity.builder().id(1L).name("Electronics").build();

    // then — unknown category does not match any named category
    assertThat(transient1).isNotEqualTo(electronics);
  }
}
