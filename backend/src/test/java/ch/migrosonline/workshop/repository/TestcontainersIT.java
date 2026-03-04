package ch.migrosonline.workshop.repository;

import static org.assertj.core.api.Assertions.assertThat;

import ch.migrosonline.workshop.support.RepositoryTestSupport;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class TestcontainersIT extends RepositoryTestSupport {

  @Autowired private DataSource dataSource;

  @Test
  void shouldConnectToTestcontainersMssql() throws SQLException {
    // given — Testcontainers MSSQL is running

    // when — getting a connection
    try (var connection = dataSource.getConnection()) {
      // then — connection is valid
      assertThat(connection.isValid(5)).isTrue();
    }
  }
}
