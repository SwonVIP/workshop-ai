package ch.migrosonline.workshop.controller;

import ch.migrosonline.workshop.model.CategoryResponse;
import ch.migrosonline.workshop.model.ProductResponse;
import ch.migrosonline.workshop.service.ProductService;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

  private final ProductService productService;

  @GetMapping
  public Page<ProductResponse> getProducts(
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) BigDecimal minPrice,
      @RequestParam(required = false) BigDecimal maxPrice,
      @PageableDefault(size = 12) Pageable pageable) {
    return productService.getProducts(category, search, minPrice, maxPrice, pageable);
  }

  @GetMapping("/{id}")
  public ProductResponse getProduct(@PathVariable Long id) {
    return productService.getProduct(id);
  }

  @GetMapping("/categories")
  public List<CategoryResponse> getCategories() {
    return productService.getCategories();
  }

  @GetMapping("/suggestions")
  public List<ProductResponse> getSuggestions(@RequestParam String sessionId) {
    return productService.getSuggestions(sessionId);
  }
}
