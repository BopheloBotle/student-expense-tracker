package com.student.expensetracker.expenses.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
		@NotNull @DecimalMin("0.01") BigDecimal amount,
		@NotNull LocalDate date,
		Long categoryId,
		@Size(max = 256) String note) {}

