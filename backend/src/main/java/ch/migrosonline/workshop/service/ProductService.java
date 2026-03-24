package ch.migrosonline.workshop.service;

import static ch.migrosonline.workshop.config.CacheConfig.CATEGORIES_CACHE;

import ch.migrosonline.workshop.model.CategoryResponse;
import ch.migrosonline.workshop.model.ProductResponse;
import ch.migrosonline.workshop.repository.CartRepository;
import ch.migrosonline.workshop.repository.CategoryRepository;
import ch.migrosonline.workshop.repository.ProductRepository;
import ch.migrosonline.workshop.repository.ProductSpecs;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

  private static final int MAX_SUGGESTIONS = 4;

  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;
  private final CartRepository cartRepository;

  @Transactional(readOnly = true)
  public Page<ProductResponse> getProducts(
      String category, String search, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
    var spec =
        Specification.where(ProductSpecs.hasCategory(category))
            .and(ProductSpecs.nameContains(search))
            .and(ProductSpecs.priceAtLeast(minPrice))
            .and(ProductSpecs.priceAtMost(maxPrice));
    return productRepository.findAll(spec, pageable).map(ProductResponse::from);
  }

  @Transactional(readOnly = true)
  public ProductResponse getProduct(Long id) {
    return productRepository
        .findById(id)
        .map(ProductResponse::from)
        .orElseThrow(() -> new EntityNotFoundException("Product with id " + id + " not found"));
  }

  @Cacheable(CATEGORIES_CACHE)
  public List<CategoryResponse> getCategories() {
    return categoryRepository.findAllByOrderByNameAsc().stream()
        .map(CategoryResponse::from)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ProductResponse> getSuggestions(String sessionId) {
    var cartOpt = cartRepository.findBySessionId(sessionId);
    if (cartOpt.isEmpty() || cartOpt.get().getItems().isEmpty()) {
      return List.of();
    }

    var cart = cartOpt.get();
    var cartProductIds = cart.getItems().stream().map(item -> item.getProduct().getId()).toList();
    var categoryIds =
        cart.getItems().stream()
            .map(item -> item.getProduct().getCategory().getId())
            .distinct()
            .toList();

    var candidates = productRepository.findByCategoryIdInAndIdNotIn(categoryIds, cartProductIds);
    Collections.shuffle(candidates);

    return candidates.stream().limit(MAX_SUGGESTIONS).map(ProductResponse::from).toList();
  }
}
