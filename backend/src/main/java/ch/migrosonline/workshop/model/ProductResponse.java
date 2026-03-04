package ch.migrosonline.workshop.model;

import ch.migrosonline.workshop.entity.Product;
import java.math.BigDecimal;

public record ProductResponse(
    Long id,
    String name,
    String description,
    BigDecimal price,
    String imageUrl,
    CategoryResponse category) {

  public static ProductResponse from(Product entity) {
    return new ProductResponse(
        entity.getId(),
        entity.getName(),
        entity.getDescription(),
        entity.getPrice(),
        entity.getImageUrl(),
        CategoryResponse.from(entity.getCategory()));
  }
}
