package ch.migrosonline.workshop.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ch.migrosonline.workshop.support.RepositoryTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

class CartSchemaIT extends RepositoryTestSupport {

  @Autowired private JdbcTemplate jdbcTemplate;

  @Test
  void shouldHaveCartTableWithCorrectColumns() {
    // given
    var sql =
        """
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'cart' ORDER BY ORDINAL_POSITION
        """;

    // when
    var columns = jdbcTemplate.queryForList(sql, String.class);

    // then
    assertThat(columns).containsExactly("id", "session_id", "created_at", "updated_at");
  }

  @Test
  void shouldHaveCartItemTableWithForeignKeys() {
    // given
    var sql =
        """
        SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
        WHERE CONSTRAINT_NAME IN ('fk_cart_item_cart', 'fk_cart_item_product')
        ORDER BY CONSTRAINT_NAME
        """;

    // when
    var constraints = jdbcTemplate.queryForList(sql, String.class);

    // then
    assertThat(constraints).containsExactly("fk_cart_item_cart", "fk_cart_item_product");
  }

  @Test
  void shouldEnforceUniqueSessionIdOnCart() {
    // given
    jdbcTemplate.update("INSERT INTO cart (session_id) VALUES (?)", "duplicate-session");

    // when/then
    assertThatThrownBy(
            () ->
                jdbcTemplate.update(
                    "INSERT INTO cart (session_id) VALUES (?)", "duplicate-session"))
        .isInstanceOf(DataAccessException.class);
  }

  @Test
  void shouldEnforceForeignKeyOnCartItem() {
    // given — non-existent cart_id
    var nonExistentCartId = 99999L;

    // when/then
    assertThatThrownBy(
            () ->
                jdbcTemplate.update(
                    "INSERT INTO cart_item (cart_id, product_id, quantity) VALUES (?, ?, ?)",
                    nonExistentCartId,
                    1L,
                    1))
        .isInstanceOf(DataAccessException.class);
  }
}
