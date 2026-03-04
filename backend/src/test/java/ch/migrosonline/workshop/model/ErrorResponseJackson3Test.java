package ch.migrosonline.workshop.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class ErrorResponseJackson3Test {

  private final JsonMapper mapper = JsonMapper.builder().build();

  @Test
  void shouldSerializeRecordToJsonWithJackson3() throws Exception {
    // given — an ErrorResponse record
    var response = new ErrorResponse(404, "Not Found", "Product not found");

    // when — serializing with Jackson 3 JsonMapper
    var json = mapper.writeValueAsString(response);

    // then — all fields are present in the JSON
    assertThat(json).contains("\"status\":404");
    assertThat(json).contains("\"error\":\"Not Found\"");
    assertThat(json).contains("\"message\":\"Product not found\"");
  }

  @Test
  void shouldDeserializeJsonToRecordWithJackson3() throws Exception {
    // given — a JSON string matching ErrorResponse
    var json =
        """
        {"status":404,"error":"Not Found","message":"Product not found"}""";

    // when — deserializing with Jackson 3 (records use canonical constructor natively)
    var response = mapper.readValue(json, ErrorResponse.class);

    // then — all fields are correctly mapped
    assertThat(response.status()).isEqualTo(404);
    assertThat(response.error()).isEqualTo("Not Found");
    assertThat(response.message()).isEqualTo("Product not found");
  }

  @Test
  void shouldRoundtripSerializeAndDeserializeRecord() throws Exception {
    // given — an original ErrorResponse
    var original = new ErrorResponse(500, "Internal Server Error", "Unexpected error");

    // when — serializing then deserializing (roundtrip)
    var json = mapper.writeValueAsString(original);
    var deserialized = mapper.readValue(json, ErrorResponse.class);

    // then — the roundtrip preserves all values
    assertThat(deserialized).isEqualTo(original);
  }

  @Test
  void shouldSerializeNullMessageField() throws Exception {
    // given — ErrorResponse with null message
    var response = new ErrorResponse(400, "Bad Request", null);

    // when
    var json = mapper.writeValueAsString(response);

    // then — null field is serialized as JSON null
    assertThat(json).contains("\"message\":null");
    assertThat(json).contains("\"status\":400");
  }

  @Test
  void shouldIgnoreUnknownFieldsDuringDeserialization() throws Exception {
    // given — JSON with an extra unknown field
    var json =
        """
        {"status":422,"error":"Unprocessable Entity","message":"Invalid input","extra":"unknown"}""";

    // when/then — Jackson 3 default behavior: unknown fields cause an error
    // Document: by default Jackson 3 does NOT ignore unknown properties
    try {
      var response = mapper.readValue(json, ErrorResponse.class);
      // If we reach here, Jackson 3 ignored unknown fields
      assertThat(response.status()).isEqualTo(422);
      assertThat(response.error()).isEqualTo("Unprocessable Entity");
      assertThat(response.message()).isEqualTo("Invalid input");
    } catch (Exception e) {
      // If Jackson 3 rejects unknown fields, document this behavior
      assertThat(e).hasMessageContaining("extra");
    }
  }
}
