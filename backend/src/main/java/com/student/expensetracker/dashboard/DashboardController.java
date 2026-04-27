package com.student.expensetracker.dashboard;

import com.student.expensetracker.expenses.ExpenseRepository;
import com.student.expensetracker.security.AppUserPrincipal;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
	private final ExpenseRepository expenses;

	public DashboardController(ExpenseRepository expenses) {
		this.expenses = expenses;
	}

	public record CategoryTotal(String category, BigDecimal total) {}

	public record DashboardSummary(
			LocalDate startDate, LocalDate endDate, BigDecimal totalSpent, List<CategoryTotal> byCategory) {}

	@GetMapping("/summary")
	public DashboardSummary summary(
			@AuthenticationPrincipal AppUserPrincipal principal,
			@RequestParam(required = false) LocalDate start,
			@RequestParam(required = false) LocalDate end) {
		var today = LocalDate.now();
		var startDate = start == null ? today.withDayOfMonth(1) : start;
		var endDate = end == null ? today : end;

		if (endDate.isBefore(startDate)) {
			throw new IllegalArgumentException("end must be >= start");
		}

		var total = expenses.sumForUserBetween(principal.userId(), startDate, endDate);
		var byCategory =
				expenses.totalsByCategoryBetween(principal.userId(), startDate, endDate).stream()
						.map(
								row -> {
									var name = (String) row[0];
									if (name == null) name = "Uncategorized";
									return new CategoryTotal(name, (BigDecimal) row[1]);
								})
						.toList();

		return new DashboardSummary(startDate, endDate, total, byCategory);
	}
}

