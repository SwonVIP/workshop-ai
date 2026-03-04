package ch.migrosonline.workshop.support;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import tools.jackson.databind.json.JsonMapper;

/**
 * Base class for controller slice tests.
 *
 * <p>Subclasses must be annotated with {@code @WebMvcTest(SomeController.class)}. Spring Boot 4
 * auto-configures {@link MockMvcTester}. Jackson 3 {@link JsonMapper} is imported explicitly since
 * {@code @WebMvcTest} does not auto-configure it.
 *
 * <p>Usage:
 *
 * <pre>{@code
 * @WebMvcTest(ProductController.class)
 * class ProductControllerTest extends ControllerTestSupport {
 *
 *     @MockitoBean
 *     private ProductService productService;
 *
 *     @Test
 *     void shouldReturnProducts() {
 *         assertThat(mvc.get().uri("/api/products"))
 *             .hasStatusOk();
 *     }
 * }
 * }</pre>
 */
@ImportAutoConfiguration(JacksonAutoConfiguration.class)
public abstract class ControllerTestSupport {

  @Autowired protected MockMvcTester mvc;

  @Autowired protected JsonMapper jsonMapper;
}
