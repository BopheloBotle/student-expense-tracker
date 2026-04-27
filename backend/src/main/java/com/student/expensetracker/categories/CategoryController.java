package com.student.expensetracker.categories;

import com.student.expensetracker.categories.dto.CategoryBucketRequest;
import com.student.expensetracker.categories.dto.CategoryRequest;
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
@RequestMapping("/api/categories")
public class CategoryController {
	private final CategoryRepository categories;
	private final UserRepository users;

	public CategoryController(CategoryRepository categories, UserRepository users) {
		this.categories = categories;
		this.users = users;
	}

	public record CategoryResponse(long id, String name, BudgetBucket budgetBucket) {}

	@GetMapping
	public List<CategoryResponse> list(@AuthenticationPrincipal AppUserPrincipal principal) {
		return categories.findAllByUserIdOrderByNameAsc(principal.userId()).stream()
				.map(c -> new CategoryResponse(c.getId(), c.getName(), c.getBudgetBucket()))
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public CategoryResponse create(
			@AuthenticationPrincipal AppUserPrincipal principal, @Valid @RequestBody CategoryRequest req) {
		var name = req.name().trim();
		if (categories.existsByUserIdAndNameIgnoreCase(principal.userId(), name)) {
			throw new IllegalArgumentException("Category already exists");
		}
		var user = users.findById(principal.userId()).orElseThrow();
		var c = new Category();
		c.setUser(user);
		c.setName(name);
		c = categories.save(c);
		return new CategoryResponse(c.getId(), c.getName(), c.getBudgetBucket());
	}

	@PutMapping("/{id}")
	public CategoryResponse update(
			@AuthenticationPrincipal AppUserPrincipal principal,
			@PathVariable Long id,
			@Valid @RequestBody CategoryRequest req) {
		var c = categories.findByIdAndUserId(id, principal.userId()).orElseThrow(() -> new IllegalArgumentException("Not found"));
		var name = req.name().trim();
		if (!c.getName().equalsIgnoreCase(name)
				&& categories.existsByUserIdAndNameIgnoreCase(principal.userId(), name)) {
			throw new IllegalArgumentException("Category already exists");
		}
		c.setName(name);
		c = categories.save(c);
		return new CategoryResponse(c.getId(), c.getName(), c.getBudgetBucket());
	}

	@PutMapping("/{id}/bucket")
	public CategoryResponse updateBucket(
			@AuthenticationPrincipal AppUserPrincipal principal,
			@PathVariable Long id,
			@Valid @RequestBody CategoryBucketRequest req) {
		var c = categories.findByIdAndUserId(id, principal.userId()).orElseThrow(() -> new IllegalArgumentException("Not found"));
		c.setBudgetBucket(req.bucket());
		c = categories.save(c);
		return new CategoryResponse(c.getId(), c.getName(), c.getBudgetBucket());
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@AuthenticationPrincipal AppUserPrincipal principal, @PathVariable Long id) {
		var c = categories.findByIdAndUserId(id, principal.userId()).orElseThrow(() -> new IllegalArgumentException("Not found"));
		categories.delete(c);
	}
}

