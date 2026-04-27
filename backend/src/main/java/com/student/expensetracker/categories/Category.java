package com.student.expensetracker.categories;

import com.student.expensetracker.users.User;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "categories")
public class Category {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, length = 64)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = true, length = 32)
	private BudgetBucket budgetBucket = BudgetBucket.OTHER;

	@Column(nullable = false)
	private Instant createdAt = Instant.now();

	public Long getId() {
		return id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public BudgetBucket getBudgetBucket() {
		// Existing database rows may have null for this new column.
		return budgetBucket == null ? BudgetBucket.OTHER : budgetBucket;
	}

	public void setBudgetBucket(BudgetBucket budgetBucket) {
		this.budgetBucket = budgetBucket;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}

