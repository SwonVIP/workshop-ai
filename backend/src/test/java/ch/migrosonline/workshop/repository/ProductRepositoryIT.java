package ch.migrosonline.workshop.repository;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.support.RepositoryTestSupport;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

class ProductRepositoryIT extends RepositoryTestSupport {

  @Autowired private ProductRepository productRepository;

  @Autowired private CategoryRepository categoryRepository;

  @Test
  void shouldFindAllProductsWhenPaginated() {
    // given
    var pageable = PageRequest.of(0, 10);

    // when
    var page = productRepository.findAll(pageable);

    // then
    assertThat(page.getContent()).hasSize(10);
    assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(50);
  }

  @Test
  void shouldFilterProductsByCategoryWhenCategorySpecified() {
    // given
    var spec = Specification.where(ProductSpecs.hasCategory("Electronics"));
    var pageable = PageRequest.of(0, 100);

    // when
    var page = productRepository.findAll(spec, pageable);

    // then
    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent())
        .allSatisfy(
            product -> assertThat(product.getCategory().getName()).isEqualTo("Electronics"));
  }

  @Test
  void shouldFilterProductsByNameWhenSearchApplied() {
    // given
    var spec = Specification.where(ProductSpecs.nameContains("chocolate"));
    var pageable = PageRequest.of(0, 100);

    // when
    var page = productRepository.findAll(spec, pageable);

    // then
    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent())
        .allSatisfy(product -> assertThat(product.getName().toLowerCase()).contains("chocolate"));
  }

  @Test
  void shouldFilterProductsByPriceWhenRangeSpecified() {
    // given
    var spec =
        Specification.where(ProductSpecs.priceAtLeast(new BigDecimal("50.00")))
            .and(ProductSpecs.priceAtMost(new BigDecimal("100.00")));
    var pageable = PageRequest.of(0, 100);

    // when
    var page = productRepository.findAll(spec, pageable);

    // then
    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent())
        .allSatisfy(
            product -> {
              assertThat(product.getPrice()).isGreaterThanOrEqualTo(new BigDecimal("50.00"));
              assertThat(product.getPrice()).isLessThanOrEqualTo(new BigDecimal("100.00"));
            });
  }

  @Test
  void shouldCombineFiltersWhenMultipleSpecified() {
    // given
    var spec =
        Specification.where(ProductSpecs.hasCategory("Electronics"))
            .and(ProductSpecs.priceAtMost(new BigDecimal("50.00")));
    var pageable = PageRequest.of(0, 100);

    // when
    var page = productRepository.findAll(spec, pageable);

    // then
    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent())
        .allSatisfy(
            product -> {
              assertThat(product.getCategory().getName()).isEqualTo("Electronics");
              assertThat(product.getPrice()).isLessThanOrEqualTo(new BigDecimal("50.00"));
            });
  }

  @Test
  void shouldReturnAllCategoriesSortedByNameWhenQueried() {
    // given — seed data loaded

    // when
    var categories = categoryRepository.findAllByOrderByNameAsc();

    // then
    assertThat(categories).hasSize(6);
    assertThat(categories).extracting("name").isSorted();
  }

  @Test
  void shouldReturnEmptyPageWhenNoProductsMatchFilter() {
    // given
    var spec = Specification.where(ProductSpecs.hasCategory("NonExistentCategory"));
    var pageable = PageRequest.of(0, 10);

    // when
    var page = productRepository.findAll(spec, pageable);

    // then
    assertThat(page.getContent()).isEmpty();
    assertThat(page.getTotalElements()).isZero();
  }
}
