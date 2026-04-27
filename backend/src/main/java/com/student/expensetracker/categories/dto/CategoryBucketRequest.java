package com.student.expensetracker.categories.dto;

import com.student.expensetracker.categories.BudgetBucket;
import jakarta.validation.constraints.NotNull;

public record CategoryBucketRequest(@NotNull BudgetBucket bucket) {}

