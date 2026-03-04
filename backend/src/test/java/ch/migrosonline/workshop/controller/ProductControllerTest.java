package ch.migrosonline.workshop.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.exception.ResourceNotFoundException;
import ch.migrosonline.workshop.model.CategoryResponse;
import ch.migrosonline.workshop.model.ProductResponse;
import ch.migrosonline.workshop.service.ProductService;
import ch.migrosonline.workshop.support.ControllerTestSupport;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(ProductController.class)
class ProductControllerTest extends ControllerTestSupport {

  @MockitoBean private ProductService productService;

  @Test
  void shouldReturnPaginatedProductsWhenNoFiltersApplied() {
    // given
    var category = new CategoryResponse(1L, "Electronics", "Gadgets");
    var product =
        new ProductResponse(
            1L,
            "Headphones",
            "Wireless",
            new BigDecimal("89.99"),
            "https://placehold.co/400x300?text=Headphones",
            category);
    var page = new PageImpl<>(List.of(product));
    when(productService.getProducts(isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
        .thenReturn(page);

    // when/then
    assertThat(mvc.get().uri("/api/products"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("content[0].name")
        .isEqualTo("Headphones");
  }

  @Test
  void shouldReturnPaginatedProductsWhenCategoryFilterApplied() {
    // given
    var category = new CategoryResponse(1L, "Electronics", "Gadgets");
    var product =
        new ProductResponse(
            1L,
            "Headphones",
            "Wireless",
            new BigDecimal("89.99"),
            "https://placehold.co/400x300?text=Headphones",
            category);
    var page = new PageImpl<>(List.of(product));
    when(productService.getProducts(
            eq("Electronics"), isNull(), isNull(), isNull(), any(Pageable.class)))
        .thenReturn(page);

    // when/then
    assertThat(mvc.get().uri("/api/products?category=Electronics"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("content[0].category.name")
        .isEqualTo("Electronics");
  }

  @Test
  void shouldReturnPaginatedProductsWhenSearchFilterApplied() {
    // given
    var category = new CategoryResponse(1L, "Electronics", "Gadgets");
    var product =
        new ProductResponse(
            1L,
            "Headphones",
            "Wireless",
            new BigDecimal("89.99"),
            "https://placehold.co/400x300?text=Headphones",
            category);
    var page = new PageImpl<>(List.of(product));
    when(productService.getProducts(isNull(), eq("head"), isNull(), isNull(), any(Pageable.class)))
        .thenReturn(page);

    // when/then
    assertThat(mvc.get().uri("/api/products?search=head"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("content")
        .asList()
        .hasSize(1);
  }

  @Test
  void shouldReturnPaginatedProductsWhenPriceFiltersApplied() {
    // given
    var category = new CategoryResponse(1L, "Electronics", "Gadgets");
    var product =
        new ProductResponse(
            1L,
            "Headphones",
            "Wireless",
            new BigDecimal("89.99"),
            "https://placehold.co/400x300?text=Headphones",
            category);
    var page = new PageImpl<>(List.of(product));
    when(productService.getProducts(
            isNull(),
            isNull(),
            eq(new BigDecimal("50")),
            eq(new BigDecimal("100")),
            any(Pageable.class)))
        .thenReturn(page);

    // when/then
    assertThat(mvc.get().uri("/api/products?minPrice=50&maxPrice=100"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("content[0].price")
        .isEqualTo(89.99);
  }

  @Test
  void shouldReturnEmptyPageWhenNoProductsMatchFilter() {
    // given
    when(productService.getProducts(
            eq("NonExistent"), isNull(), isNull(), isNull(), any(Pageable.class)))
        .thenReturn(Page.empty());

    // when/then
    assertThat(mvc.get().uri("/api/products?category=NonExistent"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("content")
        .asList()
        .isEmpty();
  }

  @Test
  void shouldReturnProductByIdWhenExists() {
    // given
    var category = new CategoryResponse(1L, "Electronics", "Gadgets");
    var product =
        new ProductResponse(
            42L,
            "Smart Watch",
            "Fitness tracker",
            new BigDecimal("199.99"),
            "https://placehold.co/400x300?text=Smart+Watch",
            category);
    when(productService.getProduct(42L)).thenReturn(product);

    // when/then
    assertThat(mvc.get().uri("/api/products/42"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("name")
        .isEqualTo("Smart Watch");
  }

  @Test
  void shouldReturn404WhenProductNotFound() {
    // given
    when(productService.getProduct(999L))
        .thenThrow(new ResourceNotFoundException("Product with id 999 not found"));

    // when/then
    assertThat(mvc.get().uri("/api/products/999")).hasStatus(HttpStatus.NOT_FOUND);
  }

  @Test
  void shouldReturnCategoriesWhenRequested() {
    // given
    var categories =
        List.of(
            new CategoryResponse(4L, "Books", "Reading"),
            new CategoryResponse(1L, "Electronics", "Gadgets"));
    when(productService.getCategories()).thenReturn(categories);

    // when/then
    assertThat(mvc.get().uri("/api/products/categories"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("$")
        .asList()
        .hasSize(2);
  }

  @Test
  void shouldUseDefaultPageSizeOfTwelveWhenNoSizeSpecified() {
    // given
    var pageable = PageRequest.of(0, 12);
    var emptyPage = new PageImpl<ProductResponse>(List.of(), pageable, 0);
    when(productService.getProducts(isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
        .thenReturn(emptyPage);

    // when/then
    assertThat(mvc.get().uri("/api/products"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("size")
        .isEqualTo(12);
  }
}
