package ch.migrosonline.workshop.model;

import ch.migrosonline.workshop.entity.CategoryEntity;

public record CategoryResponse(Long id, String name, String description) {

  public static CategoryResponse from(CategoryEntity entity) {
    return new CategoryResponse(entity.getId(), entity.getName(), entity.getDescription());
  }
}
