package ch.migrosonline.workshop.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.entity.Category;
import ch.migrosonline.workshop.entity.Product;
import ch.migrosonline.workshop.exception.ResourceNotFoundException;
import ch.migrosonline.workshop.repository.CategoryRepository;
import ch.migrosonline.workshop.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

  @Mock private ProductRepository productRepository;

  @Mock private CategoryRepository categoryRepository;

  @InjectMocks private ProductService productService;

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
    assertThat(result.getContent().getFirst().category().name()).isEqualTo("Electronics");
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
    assertThat(result.price()).isEqualTo(new BigDecimal("199.99"));
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
    assertThat(result.get(1).name()).isEqualTo("Electronics");
  }
}
