package ch.migrosonline.workshop.service;

import static ch.migrosonline.workshop.config.CacheConfig.CATEGORIES_CACHE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.config.CacheConfig;
import ch.migrosonline.workshop.entity.CategoryEntity;
import ch.migrosonline.workshop.model.CategoryResponse;
import ch.migrosonline.workshop.repository.CartRepository;
import ch.migrosonline.workshop.repository.CategoryRepository;
import ch.migrosonline.workshop.repository.ProductRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

/**
 * Tests that Spring's @Cacheable annotation on ProductService.getCategories() is properly wired
 * with the Caffeine cache. Uses a minimal Spring context (no web, no JPA, no DB).
 */
@SpringJUnitConfig(classes = {ProductService.class, CacheConfig.class})
class ProductServiceCacheTest {

  @MockitoBean private CategoryRepository categoryRepository;
  @MockitoBean private ProductRepository productRepository;
  @MockitoBean private CartRepository cartRepository;
  @Autowired private ProductService productService;
  @Autowired private CacheManager cacheManager;

  private final List<CategoryEntity> sampleCategories =
      List.of(
          CategoryEntity.builder()
              .id(1L)
              .name("Electronics")
              .description("Electronic devices")
              .build(),
          CategoryEntity.builder().id(2L).name("Sports").description("Sports equipment").build());

  @BeforeEach
  void setUp() {
    cacheManager.getCache(CATEGORIES_CACHE).clear();
    when(categoryRepository.findAllByOrderByNameAsc()).thenReturn(sampleCategories);
  }

  @Test
  void shouldReturnCategoriesFromCacheOnSecondCall() {
    // when — first call hits the repository
    List<CategoryResponse> firstCall = productService.getCategories();

    // and — second call should be served from cache
    List<CategoryResponse> secondCall = productService.getCategories();

    // then — repository was invoked only once
    verify(categoryRepository, times(1)).findAllByOrderByNameAsc();

    // and — both calls return the same data
    assertThat(firstCall).hasSize(2);
    assertThat(secondCall).hasSize(2);
    assertThat(firstCall.getFirst().name()).isEqualTo("Electronics");
    assertThat(secondCall.getFirst().name()).isEqualTo("Electronics");
  }

  @Test
  void shouldPopulateCacheAfterFirstCall() {
    // given — cache is empty
    assertThat(cacheManager.getCache(CATEGORIES_CACHE).get(SimpleKey.EMPTY)).isNull();

    // when
    productService.getCategories();

    // then — cache is populated
    assertThat(cacheManager.getCache(CATEGORIES_CACHE).get(SimpleKey.EMPTY)).isNotNull();
  }

  @Test
  void shouldHitRepositoryAgainAfterCacheEviction() {
    // given — categories are cached
    productService.getCategories();
    verify(categoryRepository, times(1)).findAllByOrderByNameAsc();

    // when — cache is cleared (simulating eviction)
    cacheManager.getCache(CATEGORIES_CACHE).clear();

    // and — called again
    productService.getCategories();

    // then — repository is invoked a second time
    verify(categoryRepository, times(2)).findAllByOrderByNameAsc();
  }

  @Test
  void shouldReturnUpdatedDataAfterCacheEviction() {
    // given — initial categories are cached
    List<CategoryResponse> initial = productService.getCategories();
    assertThat(initial).hasSize(2);

    // when — data changes and cache is cleared
    List<CategoryEntity> updatedCategories =
        List.of(
            CategoryEntity.builder()
                .id(1L)
                .name("Electronics")
                .description("Electronic devices")
                .build(),
            CategoryEntity.builder().id(2L).name("Sports").description("Sports equipment").build(),
            CategoryEntity.builder().id(3L).name("Books").description("Books and media").build());
    when(categoryRepository.findAllByOrderByNameAsc()).thenReturn(updatedCategories);
    cacheManager.getCache(CATEGORIES_CACHE).clear();

    // then — fresh data is returned
    List<CategoryResponse> refreshed = productService.getCategories();
    assertThat(refreshed).hasSize(3);
    assertThat(refreshed.get(2).name()).isEqualTo("Books");
  }

  /** Key used by Spring Cache for no-arg methods. */
  private static final class SimpleKey {
    static final org.springframework.cache.interceptor.SimpleKey EMPTY =
        org.springframework.cache.interceptor.SimpleKey.EMPTY;
  }
}
