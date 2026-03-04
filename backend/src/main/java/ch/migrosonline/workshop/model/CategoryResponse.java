package ch.migrosonline.workshop.model;

import ch.migrosonline.workshop.entity.Category;

public record CategoryResponse(Long id, String name, String description) {

  public static CategoryResponse from(Category entity) {
    return new CategoryResponse(entity.getId(), entity.getName(), entity.getDescription());
  }
}
