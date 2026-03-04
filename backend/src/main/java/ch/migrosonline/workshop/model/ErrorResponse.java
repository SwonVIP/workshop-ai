package ch.migrosonline.workshop.model;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Getter
@Builder
@Jacksonized
public class ErrorResponse {

  private final String error;
  private final String message;
  private final int status;
}
