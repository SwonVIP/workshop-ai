package ch.migrosonline.workshop.repository;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.support.RepositoryTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

class FlywayMigrationIT extends RepositoryTestSupport {

  @Autowired private JdbcTemplate jdbcTemplate;

  @Test
  void shouldRunBaselineMigrationSuccessfully() {
    // given — Flyway runs on startup against Testcontainers MSSQL

    // when — querying for the migration tracking table
    var count =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM WORKSHOP_MIGRATION_SCHEMA", Integer.class);

    // then — at least one migration has been recorded
    assertThat(count).isGreaterThanOrEqualTo(1);
  }
}
