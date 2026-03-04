package ch.migrosonline.workshop.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.exception.ResourceNotFoundException;
import ch.migrosonline.workshop.model.CategoryResponse;
import ch.migrosonline.workshop.model.ProductResponse;
import ch.migrosonline.workshop.service.ProductService;
import ch.migrosonline.workshop.support.ControllerTestSupport;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    assertThat(mvc.get().uri("/api/products"))
        .bodyJson()
        .extractingPath("content[0].id")
        .isEqualTo(1);
    assertThat(mvc.get().uri("/api/products"))
        .bodyJson()
        .extractingPath("content[0].description")
        .isEqualTo("Wireless");
    assertThat(mvc.get().uri("/api/products"))
        .bodyJson()
        .extractingPath("content[0].price")
        .isEqualTo(89.99);
    assertThat(mvc.get().uri("/api/products"))
        .bodyJson()
        .extractingPath("content[0].imageUrl")
        .isEqualTo("https://placehold.co/400x300?text=Headphones");
    assertThat(mvc.get().uri("/api/products"))
        .bodyJson()
        .extractingPath("content[0].category.id")
        .isEqualTo(1);
    assertThat(mvc.get().uri("/api/products"))
        .bodyJson()
        .extractingPath("content[0].category.description")
        .isEqualTo("Gadgets");
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
    assertThat(mvc.get().uri("/api/products?category=Electronics"))
        .bodyJson()
        .extractingPath("content[0].name")
        .isEqualTo("Headphones");
    assertThat(mvc.get().uri("/api/products?category=Electronics"))
        .bodyJson()
        .extractingPath("content[0].price")
        .isEqualTo(89.99);
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
    assertThat(mvc.get().uri("/api/products?search=head"))
        .bodyJson()
        .extractingPath("content[0].name")
        .isEqualTo("Headphones");
    assertThat(mvc.get().uri("/api/products?search=head"))
        .bodyJson()
        .extractingPath("content[0].id")
        .isEqualTo(1);
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
    assertThat(mvc.get().uri("/api/products?minPrice=50&maxPrice=100"))
        .bodyJson()
        .extractingPath("content[0].name")
        .isEqualTo("Headphones");
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
    assertThat(mvc.get().uri("/api/products?category=NonExistent"))
        .bodyJson()
        .extractingPath("totalElements")
        .isEqualTo(0);
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
    assertThat(mvc.get().uri("/api/products/42")).bodyJson().extractingPath("id").isEqualTo(42);
    assertThat(mvc.get().uri("/api/products/42"))
        .bodyJson()
        .extractingPath("description")
        .isEqualTo("Fitness tracker");
    assertThat(mvc.get().uri("/api/products/42"))
        .bodyJson()
        .extractingPath("price")
        .isEqualTo(199.99);
    assertThat(mvc.get().uri("/api/products/42"))
        .bodyJson()
        .extractingPath("imageUrl")
        .isEqualTo("https://placehold.co/400x300?text=Smart+Watch");
    assertThat(mvc.get().uri("/api/products/42"))
        .bodyJson()
        .extractingPath("category.name")
        .isEqualTo("Electronics");
    assertThat(mvc.get().uri("/api/products/42"))
        .bodyJson()
        .extractingPath("category.id")
        .isEqualTo(1);
  }

  @Test
  void shouldReturn404WhenProductNotFound() {
    // given
    when(productService.getProduct(999L))
        .thenThrow(new ResourceNotFoundException("Product with id 999 not found"));

    // when/then
    assertThat(mvc.get().uri("/api/products/999"))
        .hasStatus(HttpStatus.NOT_FOUND)
        .bodyJson()
        .extractingPath("status")
        .isEqualTo(404);
    assertThat(mvc.get().uri("/api/products/999"))
        .bodyJson()
        .extractingPath("error")
        .isEqualTo("Not Found");
    assertThat(mvc.get().uri("/api/products/999"))
        .bodyJson()
        .extractingPath("message")
        .isEqualTo("Product with id 999 not found");
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
    assertThat(mvc.get().uri("/api/products/categories"))
        .bodyJson()
        .extractingPath("[0].id")
        .isEqualTo(4);
    assertThat(mvc.get().uri("/api/products/categories"))
        .bodyJson()
        .extractingPath("[0].name")
        .isEqualTo("Books");
    assertThat(mvc.get().uri("/api/products/categories"))
        .bodyJson()
        .extractingPath("[0].description")
        .isEqualTo("Reading");
    assertThat(mvc.get().uri("/api/products/categories"))
        .bodyJson()
        .extractingPath("[1].name")
        .isEqualTo("Electronics");
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
    assertThat(mvc.get().uri("/api/products"))
        .bodyJson()
        .extractingPath("totalElements")
        .isEqualTo(0);
    assertThat(mvc.get().uri("/api/products"))
        .bodyJson()
        .extractingPath("content")
        .asList()
        .isEmpty();
  }

  @Test
  void shouldReturnErrorWhenProductIdIsNotNumeric() {
    // given — a non-numeric path variable

    // when/then — caught by generic exception handler as 500
    assertThat(mvc.get().uri("/api/products/abc"))
        .hasStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        .bodyJson()
        .extractingPath("status")
        .isEqualTo(500);
    assertThat(mvc.get().uri("/api/products/abc"))
        .bodyJson()
        .extractingPath("error")
        .isEqualTo("Internal Server Error");
  }

  @Test
  void shouldReturnErrorWhenMinPriceIsNotNumeric() {
    // given — a non-numeric minPrice query parameter

    // when/then — caught by generic exception handler as 500
    assertThat(mvc.get().uri("/api/products?minPrice=xyz"))
        .hasStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        .bodyJson()
        .extractingPath("status")
        .isEqualTo(500);
    assertThat(mvc.get().uri("/api/products?minPrice=xyz"))
        .bodyJson()
        .extractingPath("error")
        .isEqualTo("Internal Server Error");
  }

  @Test
  void shouldReturnEmptyPageWhenPageExceedsTotalPages() {
    // given
    var pageable = PageRequest.of(9999, 12);
    var emptyPage = new PageImpl<ProductResponse>(List.of(), pageable, 0);
    when(productService.getProducts(isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
        .thenReturn(emptyPage);

    // when/then
    assertThat(mvc.get().uri("/api/products?page=9999"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("content")
        .asList()
        .isEmpty();
    assertThat(mvc.get().uri("/api/products?page=9999"))
        .bodyJson()
        .extractingPath("totalElements")
        .isEqualTo(0);
    assertThat(mvc.get().uri("/api/products?page=9999"))
        .bodyJson()
        .extractingPath("number")
        .isEqualTo(9999);
  }

  @Test
  void shouldReturn500WhenServiceThrowsUnexpectedException() {
    // given
    when(productService.getProducts(isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
        .thenThrow(new RuntimeException("Unexpected failure"));

    // when/then
    assertThat(mvc.get().uri("/api/products"))
        .hasStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        .bodyJson()
        .extractingPath("status")
        .isEqualTo(500);
    assertThat(mvc.get().uri("/api/products"))
        .bodyJson()
        .extractingPath("error")
        .isEqualTo("Internal Server Error");
  }

  @Test
  void shouldReturnEmptyCategoryListWhenNoCategoriesExist() {
    // given
    when(productService.getCategories()).thenReturn(List.of());

    // when/then
    assertThat(mvc.get().uri("/api/products/categories"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("$")
        .asList()
        .isEmpty();
  }

  @Test
  void shouldReturnAllFiltersAppliedWhenCombined() {
    // given
    var page = Page.<ProductResponse>empty();
    when(productService.getProducts(
            eq("Electronics"),
            eq("phone"),
            eq(new BigDecimal("10")),
            eq(new BigDecimal("50")),
            any(Pageable.class)))
        .thenReturn(page);

    // when/then
    assertThat(
            mvc.get()
                .uri("/api/products?category=Electronics&search=phone&minPrice=10&maxPrice=50"))
        .hasStatusOk()
        .bodyJson()
        .extractingPath("content")
        .asList()
        .isEmpty();
    verify(productService)
        .getProducts(
            eq("Electronics"),
            eq("phone"),
            eq(new BigDecimal("10")),
            eq(new BigDecimal("50")),
            any(Pageable.class));
  }

  @Test
  void shouldReturn404WithStructuredErrorBodyWhenProductNotFound() {
    // given
    when(productService.getProduct(999L))
        .thenThrow(new ResourceNotFoundException("Product with id 999 not found"));

    // when/then
    assertThat(mvc.get().uri("/api/products/999"))
        .hasStatus(HttpStatus.NOT_FOUND)
        .bodyJson()
        .extractingPath("status")
        .isEqualTo(404);
    assertThat(mvc.get().uri("/api/products/999"))
        .bodyJson()
        .extractingPath("error")
        .isEqualTo("Not Found");
    assertThat(mvc.get().uri("/api/products/999"))
        .bodyJson()
        .extractingPath("message")
        .isEqualTo("Product with id 999 not found");
  }

  @Test
  void shouldPassSortParameterThroughPageable() {
    // given
    var pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    when(productService.getProducts(isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
        .thenReturn(Page.empty());

    // when
    assertThat(mvc.get().uri("/api/products?sort=price,asc")).hasStatusOk();

    // then
    verify(productService)
        .getProducts(isNull(), isNull(), isNull(), isNull(), pageableCaptor.capture());
    var capturedPageable = pageableCaptor.getValue();
    assertThat(capturedPageable.getSort().getOrderFor("price")).isNotNull();
    assertThat(capturedPageable.getSort().getOrderFor("price").getDirection())
        .isEqualTo(Sort.Direction.ASC);
    assertThat(capturedPageable.getSort().getOrderFor("price").getProperty()).isEqualTo("price");
  }
}
