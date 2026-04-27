package com.student.expensetracker.expenses;

import com.student.expensetracker.categories.CategoryRepository;
import com.student.expensetracker.expenses.dto.ExpenseRequest;
import com.student.expensetracker.security.AppUserPrincipal;
import com.student.expensetracker.users.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
	private final ExpenseRepository expenses;
	private final UserRepository users;
	private final CategoryRepository categories;

	public ExpenseController(ExpenseRepository expenses, UserRepository users, CategoryRepository categories) {
		this.expenses = expenses;
		this.users = users;
		this.categories = categories;
	}

	public record ExpenseResponse(
			long id,
			java.math.BigDecimal amount,
			java.time.LocalDate date,
			Long categoryId,
			String categoryName,
			String note) {}

	@GetMapping
	public List<ExpenseResponse> list(@AuthenticationPrincipal AppUserPrincipal principal) {
		return expenses.findAllByUserIdOrderByDateDescIdDesc(principal.userId()).stream()
				.map(
						e ->
								new ExpenseResponse(
										e.getId(),
										e.getAmount(),
										e.getDate(),
										e.getCategory() == null ? null : e.getCategory().getId(),
										e.getCategory() == null ? null : e.getCategory().getName(),
										e.getNote()))
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ExpenseResponse create(
			@AuthenticationPrincipal AppUserPrincipal principal, @Valid @RequestBody ExpenseRequest req) {
		var user = users.findById(principal.userId()).orElseThrow();
		var e = new Expense();
		e.setUser(user);
		e.setAmount(req.amount());
		e.setDate(req.date());
		e.setNote(req.note());
		if (req.categoryId() != null) {
			var cat =
					categories
							.findByIdAndUserId(req.categoryId(), principal.userId())
							.orElseThrow(() -> new IllegalArgumentException("Invalid categoryId"));
			e.setCategory(cat);
		}
		e = expenses.save(e);
		return new ExpenseResponse(
				e.getId(),
				e.getAmount(),
				e.getDate(),
				e.getCategory() == null ? null : e.getCategory().getId(),
				e.getCategory() == null ? null : e.getCategory().getName(),
				e.getNote());
	}

	@PutMapping("/{id}")
	public ExpenseResponse update(
			@AuthenticationPrincipal AppUserPrincipal principal,
			@PathVariable Long id,
			@Valid @RequestBody ExpenseRequest req) {
		var e =
				expenses
						.findByIdAndUserId(id, principal.userId())
						.orElseThrow(() -> new IllegalArgumentException("Not found"));
		e.setAmount(req.amount());
		e.setDate(req.date());
		e.setNote(req.note());
		if (req.categoryId() == null) {
			e.setCategory(null);
		} else {
			var cat =
					categories
							.findByIdAndUserId(req.categoryId(), principal.userId())
							.orElseThrow(() -> new IllegalArgumentException("Invalid categoryId"));
			e.setCategory(cat);
		}
		e = expenses.save(e);
		return new ExpenseResponse(
				e.getId(),
				e.getAmount(),
				e.getDate(),
				e.getCategory() == null ? null : e.getCategory().getId(),
				e.getCategory() == null ? null : e.getCategory().getName(),
				e.getNote());
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@AuthenticationPrincipal AppUserPrincipal principal, @PathVariable Long id) {
		var e =
				expenses
						.findByIdAndUserId(id, principal.userId())
						.orElseThrow(() -> new IllegalArgumentException("Not found"));
		expenses.delete(e);
	}
}

