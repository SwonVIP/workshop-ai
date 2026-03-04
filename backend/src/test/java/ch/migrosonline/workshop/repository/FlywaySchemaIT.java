package ch.migrosonline.workshop.repository;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.support.RepositoryTestSupport;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

class FlywaySchemaIT extends RepositoryTestSupport {

  @Autowired private JdbcTemplate jdbcTemplate;

  @Test
  void shouldCreateCategoryTableWithExpectedColumns() {
    // given — Flyway has run migrations

    // when — querying column metadata for the category table
    var columns =
        jdbcTemplate.queryForList(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'category' ORDER BY ORDINAL_POSITION");

    // then — category table has the expected columns
    var columnNames = columns.stream().map(row -> row.get("COLUMN_NAME").toString()).toList();
    assertThat(columnNames).containsExactly("id", "name", "description");
  }

  @Test
  void shouldCreateProductTableWithExpectedColumns() {
    // given — Flyway has run migrations

    // when — querying column metadata for the product table
    var columns =
        jdbcTemplate.queryForList(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'product' ORDER BY ORDINAL_POSITION");

    // then — product table has the expected columns
    var columnNames = columns.stream().map(row -> row.get("COLUMN_NAME").toString()).toList();
    assertThat(columnNames)
        .containsExactly(
            "id", "name", "description", "price", "image_url", "category_id", "created_at");
  }

  @Test
  void shouldHaveForeignKeyFromProductToCategory() {
    // given — Flyway has created FK constraint

    // when — querying FK constraints
    var fkCount =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_NAME = 'fk_product_category'",
            Integer.class);

    // then — FK constraint exists
    assertThat(fkCount).isEqualTo(1);
  }

  @Test
  void shouldSeedSixCategories() {
    // given — seed migration has run

    // when — counting categories
    var count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM category", Integer.class);

    // then — exactly 6 categories seeded
    assertThat(count).isEqualTo(6);
  }

  @Test
  void shouldSeedAtLeastFiftyProducts() {
    // given — seed migration has run

    // when — counting products
    var count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM product", Integer.class);

    // then — at least 50 products seeded
    assertThat(count).isGreaterThanOrEqualTo(50);
  }

  @Test
  void shouldHaveProductPricesInExpectedRange() {
    // given — seed data is loaded

    // when — querying min and max prices
    var minPrice = jdbcTemplate.queryForObject("SELECT MIN(price) FROM product", BigDecimal.class);
    var maxPrice = jdbcTemplate.queryForObject("SELECT MAX(price) FROM product", BigDecimal.class);

    // then — prices fall within CHF 4.99 to 299.99
    assertThat(minPrice).isGreaterThanOrEqualTo(new BigDecimal("4.99"));
    assertThat(maxPrice).isLessThanOrEqualTo(new BigDecimal("299.99"));
  }

  @Test
  void shouldHaveAtLeastEightProductsPerCategory() {
    // given — seed data is loaded

    // when — counting products per category
    var distributions =
        jdbcTemplate.queryForList(
            "SELECT c.name, COUNT(p.id) as product_count FROM category c JOIN product p ON p.category_id = c.id GROUP BY c.name");

    // then — every category has at least 8 products
    for (Map<String, Object> row : distributions) {
      var categoryName = row.get("name").toString();
      var productCount = ((Number) row.get("product_count")).intValue();
      assertThat(productCount)
          .as("CategoryEntity '%s' should have at least 8 products", categoryName)
          .isGreaterThanOrEqualTo(8);
    }
  }
}
