package ch.migrosonline.workshop.repository;

import ch.migrosonline.workshop.entity.Product;
import java.math.BigDecimal;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecs {

  private ProductSpecs() {}

  public static Specification<Product> hasCategory(String category) {
    return category == null
        ? Specification.unrestricted()
        : (root, query, cb) -> cb.equal(root.get("category").get("name"), category);
  }

  public static Specification<Product> nameContains(String search) {
    return search == null
        ? Specification.unrestricted()
        : (root, query, cb) ->
            cb.like(
                cb.lower(root.get("name")),
                "%" + escapeLikePattern(search.toLowerCase(java.util.Locale.ROOT)) + "%");
  }

  private static String escapeLikePattern(String input) {
    return input.replace("[", "[[]").replace("%", "[%]").replace("_", "[_]");
  }

  public static Specification<Product> priceAtLeast(BigDecimal minPrice) {
    return minPrice == null
        ? Specification.unrestricted()
        : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice);
  }

  public static Specification<Product> priceAtMost(BigDecimal maxPrice) {
    return maxPrice == null
        ? Specification.unrestricted()
        : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice);
  }
}
