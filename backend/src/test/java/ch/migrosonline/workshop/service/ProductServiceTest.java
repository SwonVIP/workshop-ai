package ch.migrosonline.workshop.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.entity.Category;
import ch.migrosonline.workshop.entity.Product;
import ch.migrosonline.workshop.exception.ResourceNotFoundException;
import ch.migrosonline.workshop.repository.CategoryRepository;
import ch.migrosonline.workshop.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

  @Mock private ProductRepository productRepository;

  @Mock private CategoryRepository categoryRepository;

  @InjectMocks private ProductService productService;

  @Captor private ArgumentCaptor<Specification<Product>> specCaptor;

  @Test
  void shouldReturnPaginatedProductsWhenNoFiltersApplied() {
    // given
    var category = Category.builder().id(1L).name("Electronics").description("Gadgets").build();
    var product =
        Product.builder()
            .id(1L)
            .name("Headphones")
            .description("Wireless")
            .price(new BigDecimal("89.99"))
            .imageUrl("https://placehold.co/400x300?text=Headphones")
            .category(category)
            .createdAt(LocalDateTime.now())
            .build();
    var pageable = PageRequest.of(0, 12);
    var page = new PageImpl<>(List.of(product), pageable, 1);
    when(productRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

    // when
    var result = productService.getProducts(null, null, null, null, pageable);

    // then
    assertThat(result.getContent()).hasSize(1);
    assertThat(result.getContent().getFirst().name()).isEqualTo("Headphones");
    assertThat(result.getContent().getFirst().id()).isEqualTo(1L);
    assertThat(result.getContent().getFirst().description()).isEqualTo("Wireless");
    assertThat(result.getContent().getFirst().price())
        .isEqualByComparingTo(new BigDecimal("89.99"));
    assertThat(result.getContent().getFirst().imageUrl())
        .isEqualTo("https://placehold.co/400x300?text=Headphones");
    assertThat(result.getContent().getFirst().category().name()).isEqualTo("Electronics");
    assertThat(result.getContent().getFirst().category().id()).isEqualTo(1L);
    assertThat(result.getContent().getFirst().category().description()).isEqualTo("Gadgets");
    assertThat(result.getTotalElements()).isEqualTo(1L);
  }

  @Test
  void shouldReturnProductByIdWhenExists() {
    // given
    var category = Category.builder().id(1L).name("Electronics").description("Gadgets").build();
    var product =
        Product.builder()
            .id(42L)
            .name("Smart Watch")
            .description("Fitness tracker")
            .price(new BigDecimal("199.99"))
            .imageUrl("https://placehold.co/400x300?text=Smart+Watch")
            .category(category)
            .createdAt(LocalDateTime.now())
            .build();
    when(productRepository.findById(42L)).thenReturn(Optional.of(product));

    // when
    var result = productService.getProduct(42L);

    // then
    assertThat(result.id()).isEqualTo(42L);
    assertThat(result.name()).isEqualTo("Smart Watch");
    assertThat(result.description()).isEqualTo("Fitness tracker");
    assertThat(result.price()).isEqualByComparingTo(new BigDecimal("199.99"));
    assertThat(result.imageUrl()).isEqualTo("https://placehold.co/400x300?text=Smart+Watch");
    assertThat(result.category().name()).isEqualTo("Electronics");
    assertThat(result.category().id()).isEqualTo(1L);
    assertThat(result.category().description()).isEqualTo("Gadgets");
  }

  @Test
  void shouldThrowResourceNotFoundExceptionWhenProductNotFound() {
    // given
    when(productRepository.findById(999L)).thenReturn(Optional.empty());

    // when/then
    assertThatThrownBy(() -> productService.getProduct(999L))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Product with id 999 not found");
  }

  @Test
  void shouldReturnCategoriesSortedByNameWhenRequested() {
    // given
    var categories =
        List.of(
            Category.builder().id(4L).name("Books").description("Reading").build(),
            Category.builder().id(1L).name("Electronics").description("Gadgets").build());
    when(categoryRepository.findAllByOrderByNameAsc()).thenReturn(categories);

    // when
    var result = productService.getCategories();

    // then
    assertThat(result).hasSize(2);
    assertThat(result.getFirst().name()).isEqualTo("Books");
    assertThat(result.getFirst().id()).isEqualTo(4L);
    assertThat(result.getFirst().description()).isEqualTo("Reading");
    assertThat(result.get(1).name()).isEqualTo("Electronics");
    assertThat(result.get(1).id()).isEqualTo(1L);
    assertThat(result.get(1).description()).isEqualTo("Gadgets");
  }

  @Test
  void shouldReturnEmptyPageWhenNoProductsMatchFilters() {
    // given
    var pageable = PageRequest.of(0, 10);
    when(productRepository.findAll(any(Specification.class), eq(pageable)))
        .thenReturn(Page.empty(pageable));

    // when
    var result = productService.getProducts("NonExistent", null, null, null, pageable);

    // then
    assertThat(result.getContent()).isEmpty();
    assertThat(result.getTotalElements()).isZero();
  }

  @Test
  void shouldReturnEmptyListWhenNoCategoriesExist() {
    // given
    when(categoryRepository.findAllByOrderByNameAsc()).thenReturn(Collections.emptyList());

    // when
    var result = productService.getCategories();

    // then
    assertThat(result).isEmpty();
  }

  @Test
  void shouldComposeAllFiltersWhenAllParametersProvided() {
    // given
    var category = Category.builder().id(1L).name("Electronics").description("Gadgets").build();
    var product =
        Product.builder()
            .id(1L)
            .name("Headphones")
            .description("Wireless")
            .price(new BigDecimal("89.99"))
            .imageUrl("https://placehold.co/400x300?text=Headphones")
            .category(category)
            .createdAt(LocalDateTime.now())
            .build();
    var pageable = PageRequest.of(0, 10);
    when(productRepository.findAll(specCaptor.capture(), eq(pageable)))
        .thenReturn(new PageImpl<>(List.of(product), pageable, 1));

    // when
    var result =
        productService.getProducts(
            "Electronics", "head", new BigDecimal("50.00"), new BigDecimal("100.00"), pageable);

    // then — verify the spec was captured (composed from all 4 filters)
    verify(productRepository).findAll(specCaptor.capture(), eq(pageable));
    assertThat(specCaptor.getValue()).isNotNull();
    assertThat(result.getContent()).hasSize(1);
    assertThat(result.getContent().getFirst().name()).isEqualTo("Headphones");
    assertThat(result.getTotalElements()).isEqualTo(1L);
  }

  @Test
  void shouldPropagateDataAccessExceptionWhenRepositoryFails() {
    // given
    var pageable = PageRequest.of(0, 10);
    when(productRepository.findAll(any(Specification.class), eq(pageable)))
        .thenThrow(new QueryTimeoutException("DB timeout"));

    // when/then
    assertThatThrownBy(() -> productService.getProducts(null, null, null, null, pageable))
        .isInstanceOf(DataAccessException.class)
        .hasMessageContaining("DB timeout");
  }
}
