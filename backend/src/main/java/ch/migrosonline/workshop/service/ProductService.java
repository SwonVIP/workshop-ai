package ch.migrosonline.workshop.service;

import ch.migrosonline.workshop.exception.ResourceNotFoundException;
import ch.migrosonline.workshop.model.CategoryResponse;
import ch.migrosonline.workshop.model.ProductResponse;
import ch.migrosonline.workshop.repository.CategoryRepository;
import ch.migrosonline.workshop.repository.ProductRepository;
import ch.migrosonline.workshop.repository.ProductSpecs;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;

  public Page<ProductResponse> getProducts(
      String category, String search, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
    var spec =
        Specification.where(ProductSpecs.hasCategory(category))
            .and(ProductSpecs.nameContains(search))
            .and(ProductSpecs.priceAtLeast(minPrice))
            .and(ProductSpecs.priceAtMost(maxPrice));
    return productRepository.findAll(spec, pageable).map(ProductResponse::from);
  }

  public ProductResponse getProduct(Long id) {
    return productRepository
        .findById(id)
        .map(ProductResponse::from)
        .orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " not found"));
  }

  public List<CategoryResponse> getCategories() {
    return categoryRepository.findAllByOrderByNameAsc().stream()
        .map(CategoryResponse::from)
        .toList();
  }
}
