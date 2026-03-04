package ch.migrosonline.workshop.model;

import java.util.Map;

public record ValidationErrorResponse(
    Integer status, String error, String message, Map<String, String> fieldErrors) {}
