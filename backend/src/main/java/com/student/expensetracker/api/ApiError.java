package com.student.expensetracker.api;

import java.time.Instant;
import java.util.Map;

public record ApiError(String message, Instant timestamp, Map<String, String> fieldErrors) {
	public static ApiError simple(String message) {
		return new ApiError(message, Instant.now(), Map.of());
	}
}

