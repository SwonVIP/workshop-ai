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

    // then — roundtrip deserialize and verify each field
    var deserialized = mapper.readValue(json, ErrorResponse.class);
    assertThat(deserialized.status()).isEqualTo(404);
    assertThat(deserialized.error()).isEqualTo("Not Found");
    assertThat(deserialized.message()).isEqualTo("Product not found");
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

    // then — roundtrip deserialize and verify null message preserved
    var deserialized = mapper.readValue(json, ErrorResponse.class);
    assertThat(deserialized.status()).isEqualTo(400);
    assertThat(deserialized.error()).isEqualTo("Bad Request");
    assertThat(deserialized.message()).isNull();
  }

  @Test
  void shouldIgnoreUnknownFieldsDuringDeserialization() throws Exception {
    // given — JSON with an extra unknown field
    var json =
        """
        {"status":422,"error":"Unprocessable Entity","message":"Invalid input","extra":"unknown"}""";

    // when — Jackson 3 ignores unknown fields by default
    var response = mapper.readValue(json, ErrorResponse.class);

    // then — known fields are correctly mapped, unknown field is silently ignored
    assertThat(response.status()).isEqualTo(422);
    assertThat(response.error()).isEqualTo("Unprocessable Entity");
    assertThat(response.message()).isEqualTo("Invalid input");
  }
}
