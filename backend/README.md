# Workshop AI — Backend

Spring Boot 4.0.3 REST API for the e-commerce workshop scaffold.

## Prerequisites

- Java 21+
- Maven 3.9+
- Docker (for SQL Server 2022)

## Quick Start

```bash
# Start the application (Docker Compose auto-starts SQL Server)
mvn spring-boot:run

# The API is available at http://localhost:9000
# Swagger UI:  http://localhost:9000/swagger-ui
# Health:      http://localhost:9000/actuator/health
```

> **Note**: Spring Boot Docker Compose integration automatically starts SQL Server when the application boots. No manual `docker-compose up` needed.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Paginated product list with filters |
| GET | `/api/products/{id}` | Single product by ID |
| GET | `/api/products/categories` | All categories (cached 1h) |
| GET | `/api/cart` | Get cart by session |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/{id}` | Update item quantity |
| DELETE | `/api/cart/items/{id}` | Remove item from cart |
| DELETE | `/api/cart` | Clear entire cart |

**Session management**: All cart endpoints require an `X-Cart-Session` header with a valid UUID.

### Product Filtering

```
GET /api/products?category=Electronics&search=headphones&minPrice=50&maxPrice=200&page=0&size=12&sort=price,asc
```

## Testing

```bash
# Unit tests only (Surefire)
mvn test

# Unit + integration tests (Failsafe — requires Docker for Testcontainers)
mvn verify

# Code coverage report (JaCoCo)
mvn verify
# Report: target/site/jacoco/index.html
```

### Test Infrastructure

| Base Class | Purpose | Provides |
|------------|---------|----------|
| `ControllerTestSupport` | Controller slice tests | `MockMvcTester`, `JsonMapper` (Jackson 3), `@WebMvcTest` |
| `RepositoryTestSupport` | Repository integration tests | Testcontainers MSSQL, Flyway, `@DataJpaTest` |

### Test Counts

| Suite | Count |
|-------|-------|
| Unit tests (Surefire) | 85 |
| Integration tests (Failsafe) | 40 |
| **Total** | **125** |

## Quality Gates

```bash
# Code formatting (Google Java Format via Spotless)
mvn spotless:check          # Verify
mvn spotless:apply          # Auto-fix

# Static analysis (Checkstyle — severity: error)
mvn checkstyle:check

# Mutation testing (PIT — requires JDK 21, incompatible with JDK 25)
mvn org.pitest:pitest-maven:mutationCoverage
```

## Architecture

```
src/main/java/ch/migrosonline/workshop/
├── config/          # WebConfig (CORS), CacheConfig (Caffeine)
├── controller/      # REST controllers (ProductController, CartController)
├── entity/          # JPA entities (Product, Category, Cart, CartItem)
├── exception/       # GlobalExceptionHandler, ResourceNotFoundException
├── mapper/          # CartMapper (entity → DTO)
├── model/           # Records: request/response DTOs
├── repository/      # Spring Data repos + ProductSpecs (JPA Specifications)
└── service/         # ProductService, CartService

src/main/resources/
├── application.properties    # Server config (port 9000)
├── compose.yml               # SQL Server 2022 Docker Compose
└── db/migration/             # Flyway SQL migrations (V1-V5)

src/test/java/ch/migrosonline/workshop/
├── controller/      # @WebMvcTest controller tests
├── mapper/          # CartMapper unit tests
├── model/           # Record + Jackson 3 serialization tests
├── repository/      # @DataJpaTest integration tests (Testcontainers)
├── service/         # Unit tests (Mockito) + cache tests
└── support/         # Test base classes
```

## Key Design Decisions

- **Java records** for all DTOs (Jackson 3 compatible, no Lombok on DTOs)
- **Lombok** on entities (`@Getter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- **Boxed types only** (`Integer`, `Long`, `Boolean` — never primitives)
- **JPA Specifications** for composable query filters
- **`@EntityGraph`** on cart queries to prevent N+1
- **Caffeine cache** on categories (1h TTL)
- **`@PrePersist`/`@PreUpdate`** for audit timestamps
- **UUID session validation** on cart endpoints
- **Virtual threads** enabled (`spring.threads.virtual.enabled=true`)
