# Workshop AI — Backend

Spring Boot 4.0.3 backend for the e-commerce workshop scaffold.

## Prerequisites

- Java 21
- Maven 3.9+
- Docker (for SQL Server 2022)

## Quick Start

```bash
# Start SQL Server
docker-compose up -d

# Build and run
mvn clean compile
mvn spring-boot:run

# Access
# API:        http://localhost:9000
# Swagger UI: http://localhost:9000/swagger-ui
# Health:     http://localhost:9000/actuator/health
```

## Quality Gates

```bash
# Code formatting (Google Java Format)
mvn spotless:check          # Verify formatting
mvn spotless:apply          # Auto-fix formatting

# Static analysis
mvn checkstyle:check

# Mutation testing (requires JDK 21)
mvn org.pitest:pitest-maven:mutationCoverage
```

## Testing

```bash
# Unit tests only
mvn test

# Unit + integration tests (requires Docker)
mvn verify
```

### Test Infrastructure

| Base Class | Annotation | Provides |
|---|---|---|
| `ControllerTestSupport` | `@WebMvcTest(YourController.class)` | `MockMvcTester`, `ObjectMapper` |
| `RepositoryTestSupport` | *(inherited)* | Testcontainers MSSQL, Flyway, JPA |

## Project Structure

```
src/main/java/ch/migrosonline/workshop/
├── config/          # WebConfig (CORS), CacheConfig (Caffeine)
├── controller/      # REST controllers
├── entity/          # JPA entities
├── exception/       # GlobalExceptionHandler, ResourceNotFoundException
├── mapper/          # Entity ↔ DTO mappers
├── model/           # DTOs (request/response)
├── repository/      # Spring Data repositories
└── service/         # Business logic
```
