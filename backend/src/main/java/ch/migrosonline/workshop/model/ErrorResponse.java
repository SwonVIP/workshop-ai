package ch.migrosonline.workshop.model;

public record ErrorResponse(Integer status, String error, String message) {}
