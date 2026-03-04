package ch.migrosonline.workshop.repository;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.entity.ProductEntity;
import ch.migrosonline.workshop.support.RepositoryTestSupport;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
    assertThat(page.getTotalElements()).isEqualTo(50);
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
    assertThat(categories)
        .extracting("name")
        .containsExactly(
            "Books",
            "Clothing",
            "Electronics",
            "Food & Beverages",
            "Home & Garden",
            "Sports & Outdoors");
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

  @Test
  void shouldReturnProductByIdWhenExists() {
    // given — seeded product id 1 = "Wireless Bluetooth Headphones"
    Long productId = 1L;

    // when
    var result = productRepository.findById(productId);

    // then
    assertThat(result).isPresent();
    var product = result.get();
    assertThat(product.getName()).isEqualTo("Wireless Bluetooth Headphones");
    assertThat(product.getDescription())
        .isEqualTo("Premium noise-cancelling over-ear headphones with 30h battery");
    assertThat(product.getPrice()).isEqualByComparingTo(new BigDecimal("89.99"));
    assertThat(product.getImageUrl())
        .isEqualTo("https://placehold.co/400x300?text=Wireless+Bluetooth+Headphones");
    assertThat(product.getCategory().getName()).isEqualTo("Electronics");
  }

  @Test
  void shouldReturnEmptyWhenProductIdDoesNotExist() {
    // given
    Long nonExistentId = 99999L;

    // when
    var result = productRepository.findById(nonExistentId);

    // then
    assertThat(result).isEmpty();
  }

  @Test
  void shouldReturnEmptyPageWhenPageExceedsTotalPages() {
    // given
    var pageable = PageRequest.of(100, 10);

    // when
    var page = productRepository.findAll(pageable);

    // then
    assertThat(page.getContent()).isEmpty();
    assertThat(page.getTotalElements()).isEqualTo(50);
  }

  @Test
  void shouldReturnProductsSortedByPriceAscending() {
    // given
    var pageable = PageRequest.of(0, 100, Sort.by("price").ascending());

    // when
    var page = productRepository.findAll(pageable);

    // then
    assertThat(page.getContent()).hasSizeGreaterThan(1);
    assertThat(page.getContent()).extracting(ProductEntity::getPrice).isSorted();
  }

  @Test
  void shouldFilterByPriceAtLeastAloneWithoutMaxPrice() {
    // given
    var minPrice = new BigDecimal("100.00");
    var spec = Specification.where(ProductSpecs.priceAtLeast(minPrice));
    var pageable = PageRequest.of(0, 100);

    // when
    var page = productRepository.findAll(spec, pageable);

    // then
    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent())
        .allSatisfy(product -> assertThat(product.getPrice()).isGreaterThanOrEqualTo(minPrice));
  }

  @Test
  void shouldFilterByPriceAtMostAloneWithoutMinPrice() {
    // given
    var maxPrice = new BigDecimal("20.00");
    var spec = Specification.where(ProductSpecs.priceAtMost(maxPrice));
    var pageable = PageRequest.of(0, 100);

    // when
    var page = productRepository.findAll(spec, pageable);

    // then
    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent())
        .allSatisfy(product -> assertThat(product.getPrice()).isLessThanOrEqualTo(maxPrice));
  }

  @Test
  void shouldReturnExactPriceMatchWhenMinEqualsMax() {
    // given — seed has products at 29.99 (Yoga Mat, Swiss Chocolate Box, Ceramic Plant Pot)
    var exactPrice = new BigDecimal("29.99");
    var spec =
        Specification.where(ProductSpecs.priceAtLeast(exactPrice))
            .and(ProductSpecs.priceAtMost(exactPrice));
    var pageable = PageRequest.of(0, 100);

    // when
    var page = productRepository.findAll(spec, pageable);

    // then
    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent())
        .allSatisfy(product -> assertThat(product.getPrice()).isEqualByComparingTo(exactPrice));
  }

  @Test
  void shouldReturnNoProductsWhenSearchContainsLikeWildcards() {
    // given — searching with LIKE meta-characters should NOT match everything
    var specPercent = Specification.where(ProductSpecs.nameContains("%"));
    var specUnderscore = Specification.where(ProductSpecs.nameContains("_"));
    var pageable = PageRequest.of(0, 100);

    // when
    var pagePercent = productRepository.findAll(specPercent, pageable);
    var pageUnderscore = productRepository.findAll(specUnderscore, pageable);

    // then — no products have literal % or _ in their name
    assertThat(pagePercent.getContent()).isEmpty();
    assertThat(pageUnderscore.getContent()).isEmpty();
  }

  @Test
  void shouldReturnAllProductsWhenAllSpecsAreUnrestricted() {
    // given
    Specification<ProductEntity> spec =
        Specification.where(ProductSpecs.hasCategory(null))
            .and(ProductSpecs.nameContains(null))
            .and(ProductSpecs.priceAtLeast(null))
            .and(ProductSpecs.priceAtMost(null));
    var pageable = PageRequest.of(0, 100);

    // when
    var page = productRepository.findAll(spec, pageable);

    // then
    assertThat(page.getTotalElements()).isEqualTo(50);
  }

  @Test
  void shouldReturnAllProductsWhenSearchIsEmptyString() {
    // given — empty string search should behave like no filter
    var specEmpty = Specification.where(ProductSpecs.nameContains(""));
    var specNull = Specification.where(ProductSpecs.nameContains(null));
    var pageable = PageRequest.of(0, 100);

    // when
    var pageEmpty = productRepository.findAll(specEmpty, pageable);
    var pageNull = productRepository.findAll(specNull, pageable);

    // then
    assertThat(pageEmpty.getTotalElements()).isEqualTo(pageNull.getTotalElements());
    assertThat(pageEmpty.getTotalElements()).isEqualTo(50);
  }
}
